import React, { useState } from 'react';
import { StyleSheet, View} from 'react-native';
import { Input, Text }  from '@ui-kitten/components';

// create contest with a title and an upload button
 const CreateContest = ({
   navigation
 }) => {
    const [title, setTitle] = useState('')
  
    return (
      <View style={styles.container}>
        <Text>Create Contest</Text>
        <Input
          placeholder="title"
          onChangeText={(title) => setTitle(title)}
        />
        {/* <PickImage /> */}
      </View>
    );
 }

 const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
 
 export default CreateContest;
 