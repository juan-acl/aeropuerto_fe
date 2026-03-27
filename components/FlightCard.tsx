import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Importamos la interfaz desde el archivo de datos para asegurar que la encuentre
import { Vuelo } from '../types/data/mockData';

export const FlightCard = ({ vuelo }: { vuelo: Vuelo }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_VUELO': return '#2ecc71';
      case 'CANCELADO': return '#e74c3c';
      case 'PROGRAMADO': return '#3498db';
      default: return '#34495e';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.flightNumber}>{vuelo.numero_vuelo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vuelo.estado_vuelo) }]}>
          <Text style={styles.statusText}>{vuelo.estado_vuelo}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Puerta: {vuelo.id_puerta_salida || 'TBD'}</Text>
        <Text style={styles.time}>Salida: {vuelo.hora_salida_programada.split('T')[1].substring(0,5)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginVertical: 8, borderLeftWidth: 5, borderLeftColor: '#003366', elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flightNumber: { fontSize: 18, fontWeight: 'bold', color: '#003366' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  label: { color: '#7f8c8d' },
  time: { fontWeight: '600' }
});