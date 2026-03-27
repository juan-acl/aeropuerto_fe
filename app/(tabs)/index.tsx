import React from 'react';
import { FlatList, StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { FlightCard } from '../../components/FlightCard'; 
import { MOCK_VUELOS } from '../../types/data/mockData';

// La clave es que diga "export default function"
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.airportName}>AEROPUERTO LA AURORA</Text>
        <Text style={styles.title}>Panel de Vuelos</Text>
      </View>

      <FlatList
        data={MOCK_VUELOS}
        renderItem={({ item }) => <FlightCard vuelo={item} />}
        keyExtractor={(item) => item.id_vuelo.toString()}
        contentContainerStyle={{ padding: 15 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#003366', padding: 20, paddingTop: 50 },
  airportName: { color: '#BDC3C7', fontSize: 10, textAlign: 'center', letterSpacing: 2 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }
});