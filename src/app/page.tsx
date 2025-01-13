"use client"
import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { Activity, Car, WifiOff, AlertCircle, Users } from 'lucide-react';

interface ViolationItem {
  message: string;
  timestamp: string;
  type: 'pedestrian' | 'vehicle';
}

const ThemeList = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
  "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
];

export default function TrafficMonitoring() {
  const [lightStatus, setLightStatus] = useState('');
  const [sensor1Value, setSensor1Value] = useState('Menunggu data...');
  const [sensor2Value, setSensor2Value] = useState('Menunggu data...');
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [connectionStatus, setConnectionStatus] = useState<{
    message: string;
    type: 'info' | 'success' | 'error';
  }>({
    message: 'Menghubungkan ke MQTT broker...',
    type: 'info',
  });

  const MAX_VIOLATIONS = 10;

  useEffect(() => {
    const client = mqtt.connect('ws://broker.emqx.io:8084/mqtt');

    client.on('connect', () => {
      setConnectionStatus({
        message: 'Terhubung ke MQTT broker',
        type: 'success',
      });
      client.subscribe('traffic/#');
    });

    client.on('offline', () => {
      setConnectionStatus({
        message: 'Terputus dari MQTT broker',
        type: 'error',
      });
    });

    client.on('message', (topic: string, message: Buffer) => {
      const messageStr = message.toString();

      switch (topic) {
        case 'traffic/sensor1':
          setSensor1Value(`${messageStr} cm`);
          break;
        case 'traffic/sensor2':
          setSensor2Value(`${messageStr} cm`);
          break;
        case 'traffic/light':
          setLightStatus(messageStr);
          break;
        case 'traffic/violation':
          const newViolation: ViolationItem = {
            message: messageStr,
            timestamp: new Date().toLocaleTimeString(),
            type: messageStr.includes('Pedestrian detected') ? 'pedestrian' : 'vehicle',
          };
          setViolations((prev) => {
            const updated = [newViolation, ...prev];
            return updated.slice(0, MAX_VIOLATIONS);
          });
          break;
      }
    });

    client.on('error', (error: Error) => {
      setConnectionStatus({
        message: `Error: ${error.message}`,
        type: 'error',
      });
    });

    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const getLightStatusClasses = (status: string) => {
    const baseClasses = {
      RED: 'text-red-500',
      GREEN: 'text-green-500',
      YELLOW: 'text-yellow-500',
    }[status.toUpperCase()] || 'text-base-content';

    return `${baseClasses} transition-colors duration-200`;
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar with gradient */}
      <div className="bg-base-200 shadow-md">
        <div className="navbar container mx-auto">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl font-bold text-base-content">IoT Deteksi Pelanggaran</a>
          </div>
          <div className="flex-none">
            <select 
              className="select select-bordered w-full max-w-xs text-base-content bg-base-100"
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
            >
              {ThemeList.map((theme) => (
                <option key={theme} value={theme} className="text-base-content">
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-base-content">
            Monitoring Lalu Lintas
          </h1>
          <p className="text-base-content/70">
            Sistem pemantauan real-time berbasis MQTT
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Traffic Light Status */}
          <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center gap-2 text-base-content">
                <Activity className="w-5 h-5" />
                <h2 className="card-title">Status Lampu</h2>
              </div>
              <div className="text-2xl font-bold text-center">
                <span className={getLightStatusClasses(lightStatus)}>
                  {lightStatus || 'Menunggu data...'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Sensor */}
          <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center gap-2 text-base-content">
                <Car className="w-5 h-5" />
                <h2 className="card-title">Sensor Kendaraan</h2>
              </div>
              <div className="text-2xl font-bold text-center text-base-content">
                {sensor1Value}
              </div>
              <p className="text-center text-base-content/70">Sensor 1</p>
            </div>
          </div>

          {/* Pedestrian Sensor */}
          <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center gap-2 text-base-content">
                <Users className="w-5 h-5" />
                <h2 className="card-title">Sensor Pejalan Kaki</h2>
              </div>
              <div className="text-2xl font-bold text-center text-base-content">
                {sensor2Value}
              </div>
              <p className="text-center text-base-content/70">Sensor 2</p>
            </div>
          </div>
        </div>

        {/* Violations */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex items-center gap-2 text-base-content">
              <AlertCircle className="w-5 h-5" />
              <h2 className="card-title">Pelanggaran Terkini</h2>
            </div>
            <div className="space-y-4">
              {violations.map((violation, index) => (
                <div
                  key={index}
                  className={`alert shadow-lg ${
                    violation.type === 'pedestrian'
                      ? 'alert-success text-success-content'
                      : 'alert-error text-error-content'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-medium">{violation.message}</span>
                    <span className="opacity-90 text-sm">
                      {violation.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {violations.length === 0 && (
                <div className="text-center text-base-content/70 py-4">
                  Belum ada pelanggaran tercatat
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`alert shadow-lg ${
          connectionStatus.type === 'success'
            ? 'alert-success text-success-content'
            : connectionStatus.type === 'error'
            ? 'alert-error text-error-content'
            : 'alert-info text-info-content'
        }`}>
          {connectionStatus.type === 'error' ? (
            <WifiOff className="w-5 h-5" />
          ) : (
            <Activity className="w-5 h-5" />
          )}
          <span className="font-medium">{connectionStatus.message}</span>
        </div>
      </div>
    </div>
  );
}