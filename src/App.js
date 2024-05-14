import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api'; // eslint-disable-next-line
import Menu from './components/menu';
import Apirest from './components/apirest';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function PedidosEnCamino() {
  const [pedidosEnCamino, setPedidosEnCamino] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [directions, setDirections] = useState(null); // eslint-disable-next-line

  useEffect(() => {

    const obtenerUbicacion = async (direccion) => {
      try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=AIzaSyBAAJfxU4nL-oDNZpef5VZ0l3597g_IDXY`);
        const ubicacion = response.data.results[0].geometry.location;
        return ubicacion;
      } catch (error) {
        console.error('Error al obtener la ubicación:', error);
        return null;
      }
    };
  
    const obtenerPedidosEnCamino = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/compras/');
        const pedidos = response.data.filter(pedido => pedido.entregado === 'en camino');
        
        const pedidosConUbicacion = await Promise.all(pedidos.map(async (pedido) => {
          const ubicacion = await obtenerUbicacion(pedido.direccion);
          return {
            ...pedido,
            ubicacion: ubicacion
          };
        }));
  
        setPedidosEnCamino(pedidosConUbicacion);
      } catch (error) {
        console.error('Error al obtener los pedidos:', error);
      }
    };
  
    obtenerPedidosEnCamino();
  }, []);
  
  const enviarUbicacionAlBackend = async (ubicacionlat, ubicacionlong, idVenta) => {
    try {
      await axios.post('http://localhost:8000/api/guardar_ubicacion_chofer/', { ubicacionlat, ubicacionlong, id_venta: idVenta });
      console.log('Ubicación del chofer enviada correctamente');
    } catch (error) {
      console.error('Error al enviar la ubicación del chofer al backend:', error);
    }
  };
  
  const obtenerUbicacionActual = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUbicacionActual({ lat: latitude, lng: longitude });
          const idVenta = pedidosEnCamino.length > 0 ? pedidosEnCamino[0].id_venta : null;
          enviarUbicacionAlBackend(latitude, longitude, idVenta);
        },
        error => {
          console.error('Error al obtener la ubicación actual:', error);
        }
      );
    } else {
      console.error('Geolocalización no está soportada por este navegador.');
    }
  };
  const obtenerRuta = () => {
    if (ubicacionActual && pedidosEnCamino.length > 0) {
      const directionsService = new window.google.maps.DirectionsService();
      const waypoints = pedidosEnCamino.map(pedido => ({ location: pedido.ubicacion }));
      const origin = new window.google.maps.LatLng(ubicacionActual.lat, ubicacionActual.lng);
      const destination = pedidosEnCamino[0].ubicacion;
      
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: 'DRIVING'
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            obtenerInformacionAdicional(result);
          } else {
            console.error('Error al calcular la ruta:', status);
          }
        }
      );
    }
  };

  const obtenerInformacionAdicional = (directionsResult) => {
    if (directionsResult) {
      const leg = directionsResult.routes[0].legs[0];
      console.log('Distancia:', leg.distance.text);
      console.log('Duración:', leg.duration.text);
      // Puedes mostrar esta información en tu interfaz de usuario si lo deseas
    }
  };



  return (
    



    
    <><div>
      <h1>Pedidos en Camino</h1>
      <button onClick={obtenerUbicacionActual}>Obtener Ubicación Actual</button>
      {ubicacionActual && (
        <p>Tu ubicación actual: Latitud {ubicacionActual.lat}, Longitud {ubicacionActual.lng}</p>
      )}
      <button onClick={obtenerRuta}>Obtener Ruta</button>
      <div style={{ height: '400px', width: '100%' }}>
        <LoadScript googleMapsApiKey="AIzaSyBAAJfxU4nL-oDNZpef5VZ0l3597g_IDXY">
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={{ lat: -33.4372, lng: -70.6506 }} // Centro del mapa (puede ser ajustado)
            zoom={13} // Zoom del mapa (puede ser ajustado)
          >
            {ubicacionActual && <Marker position={ubicacionActual} label="Tú estás aquí" />}
            {pedidosEnCamino.map(pedido => (
              <Marker position={pedido.ubicacion} key={pedido.id} />
            ))}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </LoadScript>
      </div>
      <ul>
        {pedidosEnCamino.map(pedido => (
          <li key={pedido.id}>

            <strong>ID venta:</strong> {pedido.id_venta} <br />
            <strong>Nombre:</strong> {pedido.nombre}, <br />
            <strong>Dirección:</strong> {pedido.direccion}, <br />
            <strong>Ubicación:</strong> {pedido.ubicacion ? `Latitud: ${pedido.ubicacion.lat}, Longitud: ${pedido.ubicacion.lng}` : 'Ubicación no disponible'}
          </li>
        ))}
      </ul>
    </div> 
    
    
    <Router>
      <div>
        <Menu />
        <Routes>
          <Route path="/apirest" element={<Apirest />} />
          <Route path="/" element={<apirest />} />
          {/* Agrega más rutas aquí si es necesario */}
        </Routes>
      </div>
    </Router>

    </>

   
  );
}

export default PedidosEnCamino;
