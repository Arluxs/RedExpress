import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

function Ventas() {


  // Estado para almacenar las ventas recuperadas de la API
  const [ventas, setVentas] = useState([]);
  // Estado para almacenar el estado seleccionado actualmente
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('solicitado');

  // Función para cargar las ventas desde la API
  const fetchVentas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/compras/');
      setVentas(response.data);
    } catch (error) {
      console.error('Error al obtener las ventas:', error);
    }
  };

  // Función para cargar las ventas desde la API cuando el componente se monta
  useEffect(() => {
    fetchVentas();
  }, []); // Este efecto se ejecuta solo una vez al montar el componente

  // Función para manejar el cambio de estado de la venta
  const handleChangeEstado = async (idVenta) => {
    try {
      // Envía una solicitud PUT a la API para actualizar el estado de la venta
      await axios.put(`http://127.0.0.1:8000/api/compras/${idVenta}/`, { entregado: estadoSeleccionado });
      // Vuelve a cargar las ventas para reflejar el cambio
      await fetchVentas();
    } catch (error) {
      console.error('Error al cambiar el estado de la venta:', error);
    }
  };

  return (
    <div>
      <h1>Lista de Ventas</h1>
      <ul>
        {ventas.map(venta => (
          <li key={venta.id}>
            <h2>Estado de la venta: {venta.entregado}</h2>
            <p>Cliente: {venta.nombre}</p>
            <p>Dirección: {venta.direccion}</p>
            <p>Región: {venta.region}</p>
            <p>Comuna: {venta.comuna}</p>
            <p>Codigo postal: {venta.codigo_postal}</p>
            {/* Selector para cambiar el estado de la venta */}
            <select value={estadoSeleccionado} onChange={(e) => setEstadoSeleccionado(e.target.value)}>
              <option value="solicitado">Solicitado</option>
              <option value="en camino">En camino</option>
              <option value="entregado">Entregado</option>
              <option value="retrasado">Retrasado</option>
            </select>
            {/* Botón para aplicar el cambio de estado */}
            <button onClick={() => handleChangeEstado(venta.id_venta)}>Guardar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Ventas;
