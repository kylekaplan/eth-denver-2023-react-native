import React, { useState, useEffect } from 'react';
// import type { Node } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet, View,
} from 'react-native';
import { Button, Text, Spinner }  from '@ui-kitten/components';
import MetaMaskSDK from '@metamask/sdk';
import { Linking } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { lensClient } from '../App'
import { authenticate } from '../api/mutations/authentication'
import { challenge } from '../api/queries/authentication'

// Import the ethers library
import { ethers } from "ethers";

const sdk = new MetaMaskSDK({
  openDeeplink: link => {
    Linking.openURL(link);
  },
  timer: BackgroundTimer,
  dappMetadata: {
    name: 'React Native Test Dapp',
    url: 'example.com',
  },
});

const ethereum = sdk.getProvider();

const provider = new ethers.providers.Web3Provider(ethereum);

const WelcomeScreen = () => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState();
  const [token, setToken] = useState();

  // useEffect(() => {
  //   /* when the app loads, check to see if the user has already connected their wallet */
  //   checkConnection()
  // }, []);

  const checkConnection = async () => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length) {
      setAddress(accounts[0])
    }
  }


  const connect = async () => {
    const result = await ethereum.request({ method: 'eth_requestAccounts' });
    setAddress(result?.[0])
  };

  async function login() {
    try {
      setLoading(true);
      /* first request the challenge from the API server */
      const challengeInfo = await lensClient.query({
        query: challenge,
        variables: { address }
      });
      console.log('challengeInfo: ', challengeInfo);
      const signer = provider.getSigner()
      /* ask the user to sign a message with the challenge info returned from the server */
      const signature = await signer.signMessage(challengeInfo.data.challenge.text)
      /* authenticate the user */
      const authData = await lensClient.mutate({
        mutation: authenticate,
        variables: {
          address, signature
        }
      })
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const { data: { authenticate: { accessToken, refreshToken }}} = authData
      console.log({ accessToken })
      console.log({ refreshToken })
      setToken(accessToken)
      try {
        await AsyncStorage.setItem('@accessToken', accessToken);
        await AsyncStorage.setItem('@refreshToken', refreshToken);
      } catch (e) {
        // saving error
      }
    } catch (err) {
      console.log('Error signing in: ', err)
    } finally {
      setLoading(false);
    }
  }

  const signIn = async () => {
    console.log('signing in...');

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log('we back');
    console.log('accounts:', accounts);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Open Work</Text>
      { /* if the user has not yet connected their wallet, show a connect button */ }
      {
        !address && <Button onPress={connect}>Connect Wallet</Button>
      }
      { /* if the user has connected their wallet but has not yet authenticated, show them a login button */ }
      {
        address && !token && (
          <View>
            <Button onPress={login}>Sign in with Lens</Button>
          </View>
        )
      }
      { /* once the user has authenticated, show them a success message */ }
      {
        address && token && <Text>Successfully signed in!</Text>
      }
      {
        loading && <Spinner />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default WelcomeScreen;
