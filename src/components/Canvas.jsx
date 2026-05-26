import React, { useState, Suspense, useMemo, useRef, useEffect, useCallback } from 'react';
import { Canvas as R3FCanvas, useThree, useFrame } from '@react-three/fiber';
import { PivotControls, Environment, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

const PIN_MAP = {
  '9V Battery': [
    { id: 'pos', position: [-0.25, 0.9, 0], color: '#ff3333' },
    { id: 'neg', position: [0.25, 0.9, 0], color: '#0055ff' }
  ],
  'AA Battery Cell': [
    { id: 'pos', position: [0, 1.05, 0], color: '#ff3333' },
    { id: 'neg', position: [0, -1.05, 0], color: '#0055ff' }
  ],
  'Bench Power Supply': [
    { id: 'pos', position: [-0.4, -0.5, 0.94], color: '#ff3333' },
    { id: 'neg', position: [0.4, -0.5, 0.94], color: '#0055ff' }
  ],
  'Ground (GND)': [
    { id: 'gnd', position: [0, 0.5, 0], color: '#00ffcc' }
  ],
  'Potentiometer': [
    { id: 'p1', position: [-0.4, 0.4, 0.5], color: '#ff3333' },
    { id: 'wiper', position: [0, 0.4, 0.6], color: '#ffcc00' },
    { id: 'p2', position: [0.4, 0.4, 0.5], color: '#0055ff' }
  ],
  'Multimeter': [
    { id: 'pos', position: [-0.25, -0.6, 0.22], color: '#ff3333' },
    { id: 'neg', position: [0.25, -0.6, 0.22], color: '#0055ff' }
  ],
  'Oscilloscope': [
    { id: 'sig', position: [0.6, -0.45, 0.75], color: '#ff3333' },
    { id: 'gnd', position: [0.8, -0.45, 0.75], color: '#0055ff' }
  ],
  'LED Diode': [
    { id: 'anode', position: [-0.1, -0.5, 0], color: '#ff3333' },
    { id: 'cathode', position: [0.1, -0.7, 0], color: '#0055ff' }
  ],
  'Resistor': [
    { id: 'p1', position: [0, 0.9, 0], color: 'silver' },
    { id: 'p2', position: [0, -0.9, 0], color: 'silver' }
  ],
  'SPST Toggle Switch': [
    { id: 'p1', position: [-0.3, 0.25, 0.3], color: 'silver' },
    { id: 'p2', position: [0.3, 0.25, 0.3], color: 'silver' }
  ],
  'Momentary Push Button': [
    { id: 'p1', position: [-0.3, 0.25, 0.3], color: 'silver' },
    { id: 'p2', position: [0.3, 0.25, 0.3], color: 'silver' }
  ],
  'DC Brushed Motor': [
    { id: 'm1', position: [-0.4, 1.45, 0], color: '#ff3333' },
    { id: 'm2', position: [0.4, 1.45, 0], color: '#111' },
    { id: 'shaft', position: [0, 0, 1.8], color: '#fcee0a' }
  ],
  'Continuous Servo': [
    { id: 'gnd', position: [-0.2, 1.5, 0], color: '#111' },
    { id: 'vcc', position: [0, 1.5, 0], color: '#ff3333' },
    { id: 'sig', position: [0.2, 1.5, 0], color: '#ffcc00' },
    { id: 'shaft', position: [0, 0, 1.5], color: '#fcee0a' }
  ],
  'Spur Gear (Small)': [
    { id: 'shaft', position: [0, 0, 0.2], color: '#fcee0a' }
  ],
  'Spur Gear (Medium)': [
    { id: 'shaft', position: [0, 0, 0.2], color: '#fcee0a' }
  ],
  'Spur Gear (Large)': [
    { id: 'shaft', position: [0, 0, 0.2], color: '#fcee0a' }
  ],
  'Wheel & Tire': [
    { id: 'shaft', position: [0, 0, 0.3], color: '#fcee0a' }
  ],
  'Axle / Shaft': [
    { id: 'shaft1', position: [0, 0, 2], color: '#fcee0a' },
    { id: 'shaft2', position: [0, 0, -2], color: '#fcee0a' }
  ],
  'Piezo Buzzer': [
    { id: 'pos', position: [-0.3, 0.4, 0], color: '#ff3333' },
    { id: 'neg', position: [0.3, 0.4, 0], color: '#0055ff' }
  ],
  'Laser Diode': [
    { id: 'pos', position: [-0.2, -0.4, 0], color: '#ff3333' },
    { id: 'neg', position: [0.2, -0.4, 0], color: '#0055ff' }
  ],
  'Microcontroller Board': [
    { id: 'vcc', position: [-0.9, 0.2, -0.5], color: '#ff3333' },
    { id: 'gnd', position: [-0.9, 0.2, 0.5], color: '#0055ff' },
    { id: 'd0', position: [0.9, 0.2, -0.5], color: '#00ffcc' },
    { id: 'd1', position: [0.9, 0.2, 0.5], color: '#00ffcc' }
  ],
  'PCB Board (Perfboard)': [
    { id: 'vcc_in', position: [-4.5, 0.2, -3.5], color: '#ff3333' },
    { id: 'gnd_in', position: [-4.5, 0.2, -2.5], color: '#0055ff' }
  ],
  'Breadboard': [
    { id: 'vcc', position: [-3.5, 0.3, -1], color: '#ff3333' },
    { id: 'gnd', position: [-3.5, 0.3, -1.2], color: '#0055ff' }
  ]
};

const getInternalEdges = (comp) => {
  switch (comp.type) {
    case 'Resistor': return [['p1', 'p2']];
    case 'LED Diode': return [['anode', 'cathode']];
    case 'Laser Diode': return [['pos', 'neg']];
    case 'DC Brushed Motor': return [['m1', 'm2']];
    case 'SPST Toggle Switch': return comp.data?.toggled ? [['p1', 'p2']] : [];
    case 'Momentary Push Button': return comp.data?.toggled ? [['p1', 'p2']] : [];
    case 'Piezo Buzzer': return [['pos', 'neg']];
    case 'Potentiometer': return [['p1', 'wiper']];
    case 'Multimeter': return [['pos', 'neg']];
    case 'Oscilloscope': return [['sig', 'gnd']];
    default: return [];
  }
};

const MovingBelt = ({ start, end, mid, rpm }) => {
  const lineRef = useRef();
  
  useFrame((_, delta) => {
    if (lineRef.current && lineRef.current.material) {
      lineRef.current.material.dashOffset -= delta * rpm * 2;
    }
  });

  return (
    <QuadraticBezierLine 
      ref={lineRef}
      start={start} 
      end={end} 
      mid={mid} 
      color="#fcee0a" 
      lineWidth={8} 
      dashed 
      dashScale={2}
      dashSize={0.5}
      gapSize={0.3}
    />
  );
};

const MovingWire = ({ start, end, mid, color, isPowered }) => {
  const flowRef = useRef();
  
  useFrame((_, delta) => {
    if (isPowered && flowRef.current && flowRef.current.material) {
      flowRef.current.material.dashOffset -= delta * 12;
    }
  });

  return (
    <group>
      {/* Solid Base Wire */}
      <QuadraticBezierLine start={start} end={end} mid={mid} color={color} lineWidth={4} />
      
      {/* Overlaying Animated Flow */}
      {isPowered && (
        <QuadraticBezierLine 
          ref={flowRef}
          start={start} 
          end={end} 
          mid={mid} 
          color="#00ffcc" 
          lineWidth={2} 
          dashed 
          dashScale={4}
          dashSize={0.4}
          gapSize={0.6}
        />
      )}
    </group>
  );
};

const Battery9VModel = () => (
  <group>
    {/* Main Enclosure (Metallic Navy Blue) */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.0, 1.6, 0.6]} />
      <meshStandardMaterial color="#0b132b" metalness={0.8} roughness={0.2} />
    </mesh>
    {/* Top Metal Plate (Silver) */}
    <mesh position={[0, 0.81, 0]}>
      <boxGeometry args={[0.98, 0.03, 0.58]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Gold Label Band */}
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[1.02, 0.25, 0.62]} />
      <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Hex/Flower female snap ring (Negative Pole) */}
    <mesh position={[0.25, 0.9, 0]}>
      <cylinderGeometry args={[0.16, 0.16, 0.15, 6]} />
      <meshStandardMaterial color="#7a7a7a" metalness={0.95} roughness={0.2} />
    </mesh>
    {/* Circular male snap plug (Positive Pole) */}
    <mesh position={[-0.25, 0.9, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
      <meshStandardMaterial color="#b08d27" metalness={0.9} roughness={0.1} />
    </mesh>
  </group>
);

const AABatteryModel = () => (
  <group>
    {/* Main insulated canister wrap */}
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 1.8, 32]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
    </mesh>
    {/* Golden label shell */}
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.31, 0.31, 1.0, 32]} />
      <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Flat silver negative bottom cap */}
    <mesh position={[0, -0.9, 0]}>
      <cylinderGeometry args={[0.29, 0.29, 0.05, 32]} />
      <meshStandardMaterial color="#c8c8c8" metalness={0.95} roughness={0.1} />
    </mesh>
    {/* Copper/Gold positive collar cap */}
    <mesh position={[0, 0.9, 0]}>
      <cylinderGeometry args={[0.29, 0.29, 0.05, 32]} />
      <meshStandardMaterial color="#b08d27" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Positive contact button nub */}
    <mesh position={[0, 0.95, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
      <meshStandardMaterial color="#b08d27" metalness={0.95} roughness={0.1} />
    </mesh>
  </group>
);

const BenchPowerSupplyModel = ({ isPowered }) => (
  <group>
    {/* Chassis Body */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[2, 1.8, 1.8]} />
      <meshStandardMaterial color="#2d3142" roughness={0.7} metalness={0.5} />
    </mesh>
    {/* Front Faceplate */}
    <mesh position={[0, 0, 0.91]}>
      <boxGeometry args={[1.9, 1.7, 0.05]} />
      <meshStandardMaterial color="#1a1d20" roughness={0.8} />
    </mesh>
    {/* Screen Frame */}
    <mesh position={[0, 0.4, 0.94]}>
      <boxGeometry args={[1.4, 0.5, 0.02]} />
      <meshStandardMaterial color="#0f1115" roughness={0.9} />
    </mesh>
    {/* Glowing digital readout panel */}
    <mesh position={[0, 0.4, 0.96]}>
      <boxGeometry args={[1.3, 0.4, 0.01]} />
      <meshStandardMaterial 
        color={isPowered ? "#00ffcc" : "#10201c"} 
        emissive={isPowered ? "#00ffcc" : "#000000"} 
        emissiveIntensity={isPowered ? 3.5 : 0} 
      />
    </mesh>
    {/* Dial Controls (Voltage & Current tuning) */}
    <mesh position={[-0.4, -0.1, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
      <meshStandardMaterial color="#ff5a5f" roughness={0.6} />
    </mesh>
    <mesh position={[0.4, -0.1, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
      <meshStandardMaterial color="#00a8cc" roughness={0.6} />
    </mesh>
    {/* Binding Post Terminals (Red and Black caps) */}
    <mesh position={[-0.4, -0.5, 0.94]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.15, 12]} />
      <meshStandardMaterial color="#d90429" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0.4, -0.5, 0.94]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.15, 12]} />
      <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
    </mesh>
  </group>
);

const GroundModel = () => (
  <group>
    {/* Copper stake rod */}
    <mesh position={[0, -0.3, 0]}>
      <cylinderGeometry args={[0.08, 0.05, 1.2, 16]} />
      <meshStandardMaterial color="#c07040" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Brass ground clamp collar */}
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.2, 8]} />
      <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Mock green ground wire connector */}
    <mesh position={[0.08, 0.2, 0.05]} rotation={[0.2, 0.5, 0.4]}>
      <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
      <meshStandardMaterial color="#39ff14" emissive="#22aa0f" emissiveIntensity={0.2} />
    </mesh>
    {/* Ground Schematic Glyph */}
    <group position={[0, 0.45, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.05]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} />
      </mesh>
    </group>
  </group>
);

const PotentiometerModel = ({ value }) => {
  const angle = (value !== undefined ? value : 0.5) * Math.PI * 1.5 - Math.PI * 0.75;
  
  return (
    <group>
      {/* Main Base Housing */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Threaded Metal Collar */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#8e9aaf" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Rotating Dial Knob assembly */}
      <group position={[0, 0.5, 0]} rotation={[0, angle, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
          <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.08, 16]} />
          <meshStandardMaterial color="#ef233c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.37, -0.3]}>
          <boxGeometry args={[0.08, 0.04, 0.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      </group>
      {/* 3 Metal wire connection posts */}
      <mesh position={[-0.4, 0.2, 0.55]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="silver" metalness={0.95} />
      </mesh>
      <mesh position={[0, 0.2, 0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="silver" metalness={0.95} />
      </mesh>
      <mesh position={[0.4, 0.2, 0.55]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="silver" metalness={0.95} />
      </mesh>
    </group>
  );
};

const MultimeterModel = ({ isPowered, voltage }) => {
  const displayVal = isPowered ? `${voltage.toFixed(2)}V` : "0.00V";
  return (
    <group>
      {/* Handheld Yellow rubber shock case */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.4]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.5} />
      </mesh>
      {/* Dark Faceplate */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.0, 1.6, 0.32]} />
        <meshStandardMaterial color="#1a1d20" roughness={0.8} />
      </mesh>
      {/* LCD screen border */}
      <mesh position={[0, 0.4, 0.22]}>
        <boxGeometry args={[0.8, 0.4, 0.02]} />
        <meshStandardMaterial color="#1c2d1b" roughness={0.9} />
      </mesh>
      {/* Glowing screen backing */}
      <mesh position={[0, 0.4, 0.23]}>
        <boxGeometry args={[0.74, 0.34, 0.01]} />
        <meshStandardMaterial 
          color={isPowered ? "#66ff66" : "#2a3d2a"} 
          emissive={isPowered ? "#33aa33" : "#000"} 
          emissiveIntensity={isPowered ? 1.5 : 0} 
        />
      </mesh>
      {/* Selector Dial Knob (Red) */}
      <mesh position={[0, -0.2, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
        <meshStandardMaterial color="#ef233c" roughness={0.6} />
      </mesh>
      {/* Selector marker line */}
      <mesh position={[0, -0.1, 0.25]}>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Red positive jack */}
      <mesh position={[-0.25, -0.6, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#d90429" metalness={0.6} />
      </mesh>
      {/* Black negative jack */}
      <mesh position={[0.25, -0.6, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#111" metalness={0.6} />
      </mesh>
    </group>
  );
};

const OscilloscopeModel = ({ isPowered, signalType }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const points = [];
      const width = 1.2;
      const count = 30;
      const t = state.clock.getElapsedTime();
      
      for (let i = 0; i <= count; i++) {
        const x = (i / count) * width - width / 2;
        let y = 0;
        if (isPowered) {
          if (signalType === 'pulse') {
            y = Math.sin(t * 10) > 0 ? 0.35 : -0.35;
          } else if (signalType === 'analog') {
            y = 0.25;
          } else {
            y = Math.sin(x * 6 + t * 4) * 0.15;
          }
        }
        points.push(new THREE.Vector3(x, y, 0));
      }
      lineRef.current.geometry.setFromPoints(points);
    }
  });

  return (
    <group>
      {/* Main Bench Cabinet */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 1.6, 1.4]} />
        <meshStandardMaterial color="#3a3d40" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Faceplate frame */}
      <mesh position={[0, 0, 0.71]}>
        <boxGeometry args={[2.1, 1.5, 0.04]} />
        <meshStandardMaterial color="#1e2226" roughness={0.9} />
      </mesh>
      {/* CRT Screen framing */}
      <mesh position={[-0.2, 0.1, 0.74]}>
        <boxGeometry args={[1.4, 1.1, 0.02]} />
        <meshStandardMaterial color="#0b1c11" roughness={0.9} />
      </mesh>
      {/* Green screen grid mesh */}
      <mesh position={[-0.2, 0.1, 0.75]}>
        <boxGeometry args={[1.34, 1.04, 0.01]} />
        <meshStandardMaterial 
          color={isPowered ? "#00ff33" : "#0d2b0d"} 
          emissive={isPowered ? "#00ff33" : "#000"} 
          emissiveIntensity={isPowered ? 1.0 : 0} 
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Live vector line trace */}
      {isPowered && (
        <group position={[-0.2, 0.1, 0.77]}>
          <line ref={lineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#39ff14" linewidth={3} depthWrite={false} />
          </line>
        </group>
      )}
      {/* Control adjustment dials */}
      <mesh position={[0.7, 0.35, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <mesh position={[0.7, -0.05, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Red input socket */}
      <mesh position={[0.6, -0.45, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#ff3333" />
      </mesh>
      {/* Black input socket */}
      <mesh position={[0.8, -0.45, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
};

const MotorModel = ({ rpm }) => {
  const shaftRef = useRef();
  useFrame((_, delta) => {
    if (shaftRef.current) shaftRef.current.rotation.y -= delta * rpm;
  });
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Motor Body */}
      <mesh>
        <cylinderGeometry args={[1, 1, 2.5, 32]} />
        <meshStandardMaterial color="#b0b5b9" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Motor End Cap (Plastic) */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.2, 32]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* Power Contacts */}
      <mesh position={[-0.4, 1.45, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0.4, 1.45, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
      </mesh>
      {/* Motor Shaft Mount */}
      <mesh position={[0, -1.3, 0]}>
         <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
         <meshStandardMaterial color="#888" metalness={0.6} />
      </mesh>
      {/* Rotating Shaft */}
      <mesh ref={shaftRef} position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshStandardMaterial color="#e8e9eb" metalness={0.9} roughness={0.1} />
        {/* Visual spin marker */}
        <mesh position={[0.1, 0, 0]}>
           <boxGeometry args={[0.05, 0.8, 0.05]} />
           <meshStandardMaterial color="#111" />
        </mesh>
      </mesh>
    </group>
  );
};

const GearModel = ({ rpm, radius = 1.5 }) => {
  const ref = useRef();
  useFrame((_, delta) => {
     if (ref.current) ref.current.rotation.y += delta * rpm;
  });

  const teethCount = Math.floor(radius * 10);
  const instancedRef = useRef();

  useEffect(() => {
    if (instancedRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < teethCount; i++) {
        const angle = (i / teethCount) * Math.PI * 2;
        dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        dummy.rotation.set(0, -angle, 0);
        dummy.updateMatrix();
        instancedRef.current.setMatrixAt(i, dummy.matrix);
      }
      instancedRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [radius, teethCount]);

  return (
    <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      {/* Central Hub */}
      <mesh>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, 0.3, 16]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      {/* Spokes or Web */}
      <mesh>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.15, 32]} />
        <meshStandardMaterial color="#0055ff" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Outer Rim */}
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.2, 32]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Teeth */}
      <instancedMesh ref={instancedRef} args={[null, null, teethCount]}>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      {/* Visual Marker (White line to easily see rotation speed) */}
      <mesh position={[radius * 0.6, 0.1, 0]}>
         <boxGeometry args={[radius * 0.8, 0.1, 0.1]} />
         <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
};

const WheelModel = ({ rpm }) => {
  const ref = useRef();
  useFrame((_, delta) => {
     if (ref.current) ref.current.rotation.y += delta * rpm;
  });
  return (
    <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.5, 0.4, 16, 32]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[1.4, 1.4, 0.3]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <mesh position={[0.7, 0, 0]}>
         <boxGeometry args={[0.4, 0.4, 0.4]} />
         <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
};

const LEDModel = ({ isPowered, potValue }) => {
  const intensity = isPowered ? 5 * (potValue !== undefined ? potValue : 1.0) : 0;
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial 
          color={isPowered ? "#ff3333" : "#551111"} 
          emissive="#ff3333" 
          emissiveIntensity={intensity} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      <mesh position={[-0.1, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1]} />
        <meshStandardMaterial color="silver" />
      </mesh>
      <mesh position={[0.1, -0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.4]} />
        <meshStandardMaterial color="silver" />
      </mesh>
    </group>
  );
};

const PiezoModel = ({ isPowered }) => {
  const ref = useRef();
  useFrame(() => {
    if (isPowered && ref.current) {
        ref.current.position.y = (Math.random() - 0.5) * 0.1;
    } else if (ref.current) {
        ref.current.position.y = 0;
    }
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
    </group>
  );
};

const LaserModel = ({ isPowered, potValue }) => {
  const opacity = isPowered ? 0.6 * (potValue !== undefined ? potValue : 1.0) : 0;
  return (
    <group>
       <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
       </mesh>
       {isPowered && (
          <mesh position={[0, 0, -10]} rotation={[Math.PI/2, 0, 0]}>
             <cylinderGeometry args={[0.05, 0.05, 20]} />
             <meshBasicMaterial color="#ff0000" transparent opacity={opacity} />
          </mesh>
       )}
    </group>
  );
};

const AxleModel = ({ rpm }) => {
  const ref = useRef();
  useFrame((_, delta) => {
     if (ref.current) ref.current.rotation.z += delta * rpm;
  });
  return (
    <group ref={ref}>
       <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4]} />
          <meshStandardMaterial color="#ccc" metalness={0.9} />
       </mesh>
    </group>
  );
};

const ModelFactory = ({ comp, isPowered, rpm, potValue, voltage, signalType, onStartWire, onEndWire, onToggle }) => {
  const pins = PIN_MAP[comp.type] || [];
  
  const BaseMesh = () => {
    switch (comp.type) {
      case 'PCB Board (Perfboard)':
        return (
          <mesh>
            <boxGeometry args={[10, 0.2, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
            <gridHelper args={[10, 20, '#0055ff', '#0055ff']} position={[0, 0.11, 0]} material-opacity={0.3} material-transparent />
          </mesh>
        );
      case 'Breadboard':
        return (
          <mesh>
            <boxGeometry args={[8, 0.3, 3]} />
            <meshStandardMaterial color="#f8f9fa" roughness={0.5} />
            <gridHelper args={[8, 40, '#cccccc', '#cccccc']} position={[0, 0.16, 0]} />
          </mesh>
        );
      case '9V Battery':
        return <Battery9VModel />;
      case 'AA Battery Cell':
        return <AABatteryModel />;
      case 'Bench Power Supply':
        return <BenchPowerSupplyModel isPowered={isPowered} />;
      case 'Ground (GND)':
        return <GroundModel />;
      case 'Potentiometer':
        return <PotentiometerModel value={comp.data?.value} />;
      case 'DC Brushed Motor':
        return <MotorModel rpm={rpm} />;
      case 'Spur Gear (Small)':
        return <GearModel rpm={rpm} radius={0.8} />;
      case 'Spur Gear (Medium)':
        return <GearModel rpm={rpm} radius={1.5} />;
      case 'Spur Gear (Large)':
        return <GearModel rpm={rpm} radius={2.5} />;
      case 'Wheel & Tire':
        return <WheelModel rpm={rpm} />;
      case 'Axle / Shaft':
        return <AxleModel rpm={rpm} />;
      case 'LED Diode':
        return <LEDModel isPowered={isPowered} potValue={potValue} />;
      case 'Laser Diode':
        return <LaserModel isPowered={isPowered} potValue={potValue} />;
      case 'Piezo Buzzer':
        return <PiezoModel isPowered={isPowered} />;
      case 'Multimeter':
        return <MultimeterModel isPowered={isPowered} voltage={voltage} />;
      case 'Oscilloscope':
        return <OscilloscopeModel isPowered={isPowered} signalType={signalType} />;
      case 'Resistor':
        return (
          <group rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 1]} />
              <meshStandardMaterial color="#d2b48c" />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4]} />
              <meshStandardMaterial color="silver" />
            </mesh>
            <mesh position={[0, -0.7, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4]} />
              <meshStandardMaterial color="silver" />
            </mesh>
          </group>
        );
      case 'SPST Toggle Switch':
      case 'Limit Switch':
        return (
          <group>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[1, 0.5, 0.6]} />
              <meshStandardMaterial color="#0055ff" />
            </mesh>
            <mesh 
              position={[0, 0.7, 0]} 
              rotation={[0, 0, comp.data?.toggled ? -0.3 : 0.3]}
              onPointerDown={(e) => { e.stopPropagation(); onToggle(comp.id); }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <cylinderGeometry args={[0.08, 0.08, 0.5]} />
              <meshStandardMaterial color={comp.data?.toggled ? "#ff3333" : "silver"} />
            </mesh>
          </group>
        );
      case 'Momentary Push Button':
        return (
          <group>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[1, 0.5, 0.6]} />
              <meshStandardMaterial color="#0055ff" />
            </mesh>
            <mesh 
              position={[0, comp.data?.toggled ? 0.4 : 0.5, 0]} 
              onPointerDown={(e) => { e.stopPropagation(); onToggle(comp.id); }}
              onPointerUp={(e) => { e.stopPropagation(); onToggle(comp.id); }} 
              onPointerOut={(e) => { if (comp.data?.toggled) onToggle(comp.id); document.body.style.cursor = 'auto'; }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            >
              <cylinderGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#ff3333" />
            </mesh>
          </group>
        );
      case 'Microcontroller Board':
        return (
          <group>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[2, 0.2, 3]} />
              <meshStandardMaterial color="#0055ff" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
               <boxGeometry args={[1, 0.2, 1.5]} />
               <meshStandardMaterial color={isPowered ? "#22ff22" : "#111"} />
            </mesh>
            <mesh position={[-0.9, 0.1, 0]}>
               <boxGeometry args={[0.2, 0.1, 2.5]} />
               <meshStandardMaterial color="silver" />
            </mesh>
            <mesh position={[0.9, 0.1, 0]}>
               <boxGeometry args={[0.2, 0.1, 2.5]} />
               <meshStandardMaterial color="silver" />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ff00ff" wireframe />
          </mesh>
        );
    }
  };

  return (
    <group>
      <BaseMesh />
      {pins.map(pin => (
         <mesh 
           key={pin.id} 
           position={pin.position}
           onPointerDown={(e) => { e.stopPropagation(); if (onStartWire) onStartWire(comp.id, pin.id, pin.color); }}
           onPointerUp={(e) => { e.stopPropagation(); if (onEndWire) onEndWire(comp.id, pin.id); }}
           onPointerOver={() => { document.body.style.cursor = 'crosshair'; }}
           onPointerOut={() => { document.body.style.cursor = 'auto'; }}
         >
           <sphereGeometry args={[0.15]} />
           <meshStandardMaterial color={pin.color} emissive={pin.color} emissiveIntensity={0.8} />
         </mesh>
      ))}
      
      {comp.data?.locked && (
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#ff3333" />
        </mesh>
      )}
    </group>
  );
};

const DraggableModel = ({ comp, isActive, isPowered, rpm, potValue, voltage, signalType, isDragging, dragPos, onClick, onCommit, onStartWire, onEndWire, onToggle, onStartDrag }) => {
  const matrix = useMemo(() => {
    const m = new THREE.Matrix4();
    if (comp.matrix) m.fromArray(comp.matrix);
    else m.setPosition(comp.position[0], comp.position[1], comp.position[2]);
    
    if (isDragging && dragPos) {
       m.setPosition(dragPos[0], m.elements[13], dragPos[2]);
    }
    return m;
  }, [comp.matrix, comp.position, isDragging, dragPos]);

  const currentMatrixRef = useRef(matrix.clone());

  return (
    <PivotControls 
      matrix={matrix}
      visible={isActive && !comp.data?.locked && !isDragging}
      disableAxes={true} disableSliders={true} disableRotations={false}
      scale={2} depthTest={false} lineWidth={3}
      onDrag={(l) => currentMatrixRef.current.copy(l)}
      onDragEnd={() => {
        if (!currentMatrixRef.current.equals(matrix)) onCommit(comp.id, currentMatrixRef.current.toArray());
      }}
    >
      <group onPointerDown={(e) => { 
        e.stopPropagation(); 
        if (!comp.data?.locked && onStartDrag) {
           onStartDrag(comp.id);
        } else {
           onClick(comp.id); 
        }
      }}>
        <ModelFactory comp={comp} isPowered={isPowered} rpm={rpm} potValue={potValue} voltage={voltage} signalType={signalType} onStartWire={onStartWire} onEndWire={onEndWire} onToggle={onToggle} />
      </group>
    </PivotControls>
  );
};

const CameraController = ({ view }) => {
  const { camera } = useThree();
  useEffect(() => {
    const d = 15;
    switch(view) {
      case 'Top': camera.position.set(0, d, 0.1); camera.up.set(0, 1, 0); break;
      case 'Bottom': camera.position.set(0, -d, 0.1); camera.up.set(0, 1, 0); break;
      case 'Left': camera.position.set(-d, 0, 0); camera.up.set(0, 1, 0); break;
      case 'Right': camera.position.set(d, 0, 0); camera.up.set(0, 1, 0); break;
      default: camera.position.set(0, d, 0.1); break;
    }
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [view, camera]);
  return null;
};

const getPinWorldPos = (comp, pinId) => {
  const pins = PIN_MAP[comp.type] || [];
  const pin = pins.find(p => p.id === pinId);
  if (!pin) return [0, 0, 0];
  const vec = new THREE.Vector3(...pin.position);
  if (comp.matrix) vec.applyMatrix4(new THREE.Matrix4().fromArray(comp.matrix));
  else vec.add(new THREE.Vector3(...comp.position));
  return vec.toArray();
};

const Canvas = () => {
  const [history, setHistory] = useState([{
    components: [
      { id: 'PCB Board (Perfboard)-init', type: 'PCB Board (Perfboard)', position: [0, 0, 0] },
      { id: '9V Battery-init', type: '9V Battery', position: [-6, 1.5, 0] }
    ],
    wires: []
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState('Top');
  const [drawingWire, setDrawingWire] = useState(null);
  
  const [activeDragId, setActiveDragId] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const currentState = history[historyIndex];
  const currentComponents = currentState.components;
  const currentWires = currentState.wires || [];

  const mcuStatesRef = useRef({});
  const [firmwareTick, setFirmwareTick] = useState(0);

  const commitChange = useCallback((newComps, newWires = currentWires) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ components: newComps, wires: newWires });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, currentWires]);

  useEffect(() => {
    const interval = setInterval(() => {
        let changed = false;
        currentComponents.forEach(c => {
            if (c.type === 'Microcontroller Board' && c.data?.code) {
                if (!mcuStatesRef.current[c.id]) mcuStatesRef.current[c.id] = { d0: false, d1: false, mem: {} };
                
                const state = mcuStatesRef.current[c.id];
                const prevD0 = state.d0;

                try {
                    const digitalRead = (pin) => (pin === 1 ? state.d1 : false);
                    let newD0 = prevD0;
                    const digitalWrite = (pin, val) => { if (pin === 0) newD0 = !!val; };
                    
                    const run = new Function('digitalRead', 'digitalWrite', 'memory', 'Date', 'Math', c.data.code);
                    run(digitalRead, digitalWrite, state.mem, Date, Math);
                    
                    if (newD0 !== prevD0) {
                        state.d0 = newD0;
                        changed = true;
                    }
                } catch(e) {}
            }
        });
        if (changed) setFirmwareTick(t => t + 1); 
    }, 100);
    return () => clearInterval(interval);
  }, [currentComponents]);

  const { poweredIds, rpmMap, voltageMap, signalMap } = useMemo(() => {
    const powered = new Set();
    const adj = {};
    const mechAdj = {};
    
    const addEdge = (n1, n2) => {
        if (!adj[n1]) adj[n1] = [];
        if (!adj[n2]) adj[n2] = [];
        adj[n1].push(n2);
        adj[n2].push(n1);
    };

    currentWires.forEach(w => {
        if (w.sourcePinId === 'shaft' && w.targetPinId === 'shaft') {
            if (!mechAdj[w.sourceCompId]) mechAdj[w.sourceCompId] = [];
            if (!mechAdj[w.targetCompId]) mechAdj[w.targetCompId] = [];
            mechAdj[w.sourceCompId].push(w.targetCompId);
            mechAdj[w.targetCompId].push(w.sourceCompId);
        } else {
            addEdge(`${w.sourceCompId}:${w.sourcePinId}`, `${w.targetCompId}:${w.targetPinId}`);
        }
    });

    currentComponents.forEach(c => {
        getInternalEdges(c).forEach(([p1, p2]) => addEdge(`${c.id}:${p1}`, `${c.id}:${p2}`));
    });

    const hasPath = (start, end, avoidEdge) => {
        if (start === end) return true;
        if (!adj[start] || !adj[end]) return false;
        const q = [start];
        const visited = new Set([start]);
        
        while (q.length > 0) {
            const curr = q.shift();
            for (const neighbor of adj[curr]) {
                if (avoidEdge && ((curr === avoidEdge[0] && neighbor === avoidEdge[1]) || (curr === avoidEdge[1] && neighbor === avoidEdge[0]))) continue;
                if (neighbor === end) return true;
                if (!visited.has(neighbor)) { visited.add(neighbor); q.push(neighbor); }
            }
        }
        return false;
    };

    const batteries = currentComponents.filter(c => c.type === '9V Battery' || c.type === 'AA Battery Cell' || c.type === 'Bench Power Supply');
    const virtualBatteries = currentComponents.filter(c => c.type === 'Microcontroller Board' && mcuStatesRef.current[c.id]?.d0);

    currentComponents.forEach(c => {
       if (c.type === 'Microcontroller Board') {
           let d1_high = false;
           for (const bat of batteries) {
               if ((hasPath(`${bat.id}:pos`, `${c.id}:d1`) && hasPath(`${bat.id}:neg`, `${c.id}:gnd`)) ||
                   (hasPath(`${bat.id}:pos`, `${c.id}:gnd`) && hasPath(`${bat.id}:neg`, `${c.id}:d1`))) {
                   d1_high = true;
                   break;
               }
           }
           if (!mcuStatesRef.current[c.id]) mcuStatesRef.current[c.id] = { d0: false, d1: false, mem: {} };
           mcuStatesRef.current[c.id].d1 = d1_high;
           if (mcuStatesRef.current[c.id].d0 || d1_high) powered.add(c.id);
       }
    });

    currentComponents.forEach(comp => {
        const internal = getInternalEdges(comp);
        if (internal.length === 0) return;
        
        for (const [p1, p2] of internal) {
            const node1 = `${comp.id}:${p1}`;
            const node2 = `${comp.id}:${p2}`;
            
            let carriesCurrent = false;
            const avoid = [node1, node2];

            for (const bat of batteries) {
                if ((hasPath(`${bat.id}:pos`, node1, avoid) && hasPath(`${bat.id}:neg`, node2, avoid)) || 
                    (hasPath(`${bat.id}:pos`, node2, avoid) && hasPath(`${bat.id}:neg`, node1, avoid))) { 
                    carriesCurrent = true; break; 
                }
            }
            
            if (!carriesCurrent) {
               for (const vBat of virtualBatteries) {
                   if ((hasPath(`${vBat.id}:d0`, node1, avoid) && hasPath(`${vBat.id}:gnd`, node2, avoid)) || 
                       (hasPath(`${vBat.id}:d0`, node2, avoid) && hasPath(`${vBat.id}:gnd`, node1, avoid))) { 
                       carriesCurrent = true; break; 
                   }
               }
            }
            if (carriesCurrent) { powered.add(comp.id); break; }
        }
    });

    const getRadius = (compId) => {
       const c = currentComponents.find(x => x.id === compId);
       if (!c) return 1;
       if (c.type === 'Spur Gear (Small)') return 0.8;
       if (c.type === 'Spur Gear (Medium)') return 1.5;
       if (c.type === 'Spur Gear (Large)') return 2.5;
       if (c.type === 'Wheel & Tire') return 1.5;
       if (c.type === 'DC Brushed Motor') return 0.5; // Motor drive shaft effective radius
       return 1;
    };

    const voltages = {};
    const signals = {};
    const rpms = {};
    const mechQ = [];

    const pot = currentComponents.find(x => x.type === 'Potentiometer');
    const scale = pot ? (pot.data?.value !== undefined ? pot.data.value : 0.5) : 1.0;

    currentComponents.forEach(c => {
       if (c.type === 'DC Brushed Motor' && powered.has(c.id)) {
           rpms[c.id] = 20 * scale; 
           mechQ.push(c.id);
       }
    });

    const mechVisited = new Set(mechQ);
    while(mechQ.length > 0) {
       const curr = mechQ.shift();
       if (mechAdj[curr]) {
           const rCurr = getRadius(curr);
           for (const n of mechAdj[curr]) {
               if (!mechVisited.has(n)) {
                   mechVisited.add(n);
                   const rNext = getRadius(n);
                   rpms[n] = -rpms[curr] * (rCurr / rNext);
                   mechQ.push(n);
               }
           }
       }
    }

    currentComponents.forEach(c => {
      if (c.type === 'Multimeter') {
        let v = 0;
        for (const bat of batteries) {
          const baseV = bat.type === '9V Battery' ? 9.0 : (bat.type === 'AA Battery Cell' ? 1.5 : 12.0);
          const activeV = baseV * scale;
          
          if (hasPath(`${bat.id}:pos`, `${c.id}:pos`) && hasPath(`${bat.id}:neg`, `${c.id}:neg`)) {
            v = activeV; break;
          } else if (hasPath(`${bat.id}:pos`, `${c.id}:neg`) && hasPath(`${bat.id}:neg`, `${c.id}:pos`)) {
            v = -activeV; break;
          }
        }
        for (const mcu of virtualBatteries) {
          if (hasPath(`${mcu.id}:d0`, `${c.id}:pos`) && hasPath(`${mcu.id}:gnd`, `${c.id}:neg`)) {
            v = 5.0; break;
          } else if (hasPath(`${mcu.id}:d0`, `${c.id}:neg`) && hasPath(`${mcu.id}:gnd`, `${c.id}:pos`)) {
            v = -5.0; break;
          }
        }
        voltages[c.id] = v;
      }
    });

    currentComponents.forEach(c => {
      if (c.type === 'Oscilloscope') {
        let type = 'idle';
        
        const mcus = currentComponents.filter(x => x.type === 'Microcontroller Board');
        let connectedToMcu = false;
        for (const mcu of mcus) {
          if (hasPath(`${mcu.id}:d0`, `${c.id}:sig`)) {
            connectedToMcu = true; break;
          }
        }
        
        if (connectedToMcu) {
          type = 'pulse';
        } else {
          let connectedToBattery = false;
          for (const bat of batteries) {
            if (hasPath(`${bat.id}:pos`, `${c.id}:sig`)) {
              connectedToBattery = true; break;
            }
          }
          if (connectedToBattery) {
            type = 'analog';
          }
        }
        signals[c.id] = type;
      }
    });
    
    return { poweredIds: powered, rpmMap: rpms, voltageMap: voltages, signalMap: signals };
  }, [currentComponents, currentWires, firmwareTick]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && activeId) {
        const c = currentComponents.find(comp => comp.id === activeId);
        if (c?.data?.locked) return;

        const newComps = currentComponents.filter(c => c.id !== activeId);
        const newWires = currentWires.filter(w => w.sourceCompId !== activeId && w.targetCompId !== activeId);
        if (newComps.length !== currentComponents.length) { commitChange(newComps, newWires); setActiveId(null); }
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'c' && activeId) {
        e.preventDefault(); 
        const newComps = currentComponents.map(c => 
          c.id === activeId ? { ...c, data: { ...c.data, locked: !c.data?.locked } } : c
        );
        commitChange(newComps);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, currentComponents, currentWires, commitChange]);

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (!type) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    let worldX = 0, worldY = 0.5, worldZ = 0;
    if (view === 'Top') { worldX = x * 15; worldZ = -y * 10; } 
    else if (view === 'Left') { worldZ = x * 15; worldY = Math.max(0.5, y * 10); } 
    else if (view === 'Right') { worldZ = -x * 15; worldY = Math.max(0.5, y * 10); } 
    else if (view === 'Bottom') { worldX = x * 15; worldZ = y * 10; } 
    else { worldX = x * 15; worldZ = -y * 10; }

    const isMcu = type === 'Microcontroller Board';
    const initCode = `// Firmware Sandbox\n// Pins: D0 (Output), D1 (Input)\n\nif (!memory.last) memory.last = Date.now();\nif (memory.on === undefined) memory.on = false;\n\n// Blink D0 every 500ms\nif (Date.now() - memory.last > 500) {\n  memory.on = !memory.on;\n  memory.last = Date.now();\n}\n\n// Read D1 switch\nif (digitalRead(1)) {\n  digitalWrite(0, true);\n} else {\n  digitalWrite(0, memory.on);\n}`;

    const newComponent = { 
      id: `${type}-${Date.now()}`, type, position: [worldX, worldY, worldZ], 
      data: isMcu ? { code: initCode, locked: false } : { toggled: false, locked: false } 
    };
    commitChange([...currentComponents, newComponent]);
    setActiveId(newComponent.id);
  };

  const handleToggle = (id) => {
    const newComps = currentComponents.map(c => c.id === id ? { ...c, data: { ...c.data, toggled: !c.data?.toggled } } : c);
    commitChange(newComps);
  };

  const handleCodeChange = (id, newCode) => {
    const newComps = currentComponents.map(c => c.id === id ? { ...c, data: { ...c.data, code: newCode } } : c);
    commitChange(newComps);
  };

  const handleSliderChange = (id, val) => {
    const newComps = currentComponents.map(c => c.id === id ? { ...c, data: { ...c.data, value: val } } : c);
    commitChange(newComps);
  };

  const activeComp = currentComponents.find(c => c.id === activeId);

  return (
    <main className="canvas-area glass-panel">
      <div 
        className="viewport"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onDrop={handleDrop}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
          <button className="cyber-btn" onClick={() => { setHistoryIndex(Math.max(0, historyIndex - 1)); setActiveId(null); }} disabled={historyIndex === 0} style={{ padding: '0.5rem 1rem', opacity: historyIndex === 0 ? 0.5 : 1 }}>UNDO</button>
          <button className="cyber-btn" onClick={() => { setHistoryIndex(Math.min(history.length - 1, historyIndex + 1)); setActiveId(null); }} disabled={historyIndex === history.length - 1} style={{ padding: '0.5rem 1rem', opacity: historyIndex === history.length - 1 ? 0.5 : 1 }}>REDO</button>
        </div>
        
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
          <button className="cyber-btn warning" onClick={() => setShowHelp(true)} style={{ padding: '0.5rem 1rem' }}>? HELP</button>
          {['Top', 'Left', 'Right', 'Bottom'].map(v => (
            <button key={v} className={`cyber-btn ${view === v ? 'warning' : ''}`} onClick={() => { setView(v); setActiveId(null); }} style={{ padding: '0.5rem 1rem' }}>{v}</button>
          ))}
        </div>

        {showHelp && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,10,30,0.95)', border: '2px solid #00ffcc', padding: '2rem', color: '#fff', zIndex: 1000, borderRadius: '8px', boxShadow: '0 0 30px rgba(0, 255, 204, 0.4)', minWidth: '400px' }}>
                <button 
                  className="cyber-btn danger" 
                  onPointerDown={(e) => { e.stopPropagation(); setShowHelp(false); }} 
                  style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.2rem 0.5rem' }}
                >
                  X
                </button>
                <h2 style={{ color: '#00ffcc', marginTop: 0 }}>⚙️ JUNKYARD MANUAL</h2>
                <ul style={{ lineHeight: '1.8', fontSize: '14px', listStyleType: 'square' }}>
                   <li><b>Select:</b> Click on a component.</li>
                   <li><b>Rotate:</b> Select it, then drag the 3D circular rings.</li>
                   <li><b>Move:</b> Click & Drag directly on the component.</li>
                   <li><b>Lock / Unlock:</b> Select a component, then press <kbd style={{background:'#333', padding:'2px 6px', borderRadius:'4px'}}>CTRL + C</kbd>. (Locked objects cannot be moved or deleted, and show a red lock block).</li>
                   <li><b>Delete:</b> Select it, then press <kbd style={{background:'#333', padding:'2px 6px', borderRadius:'4px'}}>DELETE</kbd> or <kbd style={{background:'#333', padding:'2px 6px', borderRadius:'4px'}}>BACKSPACE</kbd>.</li>
                   <li><b>Wire Engine:</b> Drag from a Red/Blue pin to another to route power.</li>
                   <li><b>Mechanical Belts:</b> Drag between Yellow shaft pins to transfer RPM.</li>
                </ul>
                <button 
                  className="cyber-btn warning" 
                  onPointerDown={(e) => { e.stopPropagation(); setShowHelp(false); }} 
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  CLOSE MANUAL
                </button>
            </div>
        )}

        {activeComp?.type === 'Microcontroller Board' && (
           <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', width: '350px', background: 'rgba(0,10,30,0.9)', border: '1px solid #0055ff', padding: '1rem', color: '#fff', zIndex: 100, borderRadius: '4px', boxShadow: '0 0 15px rgba(0, 85, 255, 0.3)' }}>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#00ffcc', fontSize: '1rem' }}>FIRMWARE EDITOR</h3>
               <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '0.5rem' }}>API: <code style={{color:'#ff3333'}}>digitalWrite(0, bool)</code>, <code style={{color:'#0055ff'}}>digitalRead(1)</code></p>
               <textarea 
                  style={{ width: '100%', height: '220px', background: '#050510', color: '#00ffcc', border: '1px solid #333', fontFamily: 'monospace', padding: '0.5rem', outline: 'none', resize: 'none' }}
                  value={activeComp.data?.code || ''}
                  onChange={(e) => handleCodeChange(activeComp.id, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()} 
               />
               <p style={{ fontSize: '10px', color: '#666', marginTop: '0.5rem', textAlign: 'right' }}>Changes apply instantly via eval() loop</p>
           </div>
        )}

        {activeComp?.type === 'Potentiometer' && (
           <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '380px', background: 'rgba(0,10,30,0.9)', border: '1px solid #ffcc00', padding: '1rem', color: '#fff', zIndex: 100, borderRadius: '6px', boxShadow: '0 0 20px rgba(255, 204, 0, 0.3)' }}>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffcc00', fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: '1px' }}>ANALOG CONTROLLER</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <input 
                    type="range" min="0" max="1" step="0.01"
                    style={{ flex: 1, accentColor: '#ffcc00', cursor: 'pointer' }}
                    value={activeComp.data?.value !== undefined ? activeComp.data.value : 0.5}
                    onChange={(e) => handleSliderChange(activeComp.id, parseFloat(e.target.value))}
                 />
                 <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#ffcc00', minWidth: '50px', textAlign: 'right' }}>
                    {Math.round((activeComp.data?.value !== undefined ? activeComp.data.value : 0.5) * 100)}%
                 </span>
               </div>
           </div>
        )}
        
        <div 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
          onPointerUp={() => { 
            if (drawingWire) setDrawingWire(null); 
            if (activeDragId) {
                if (dragPos) {
                    const comp = currentComponents.find(c => c.id === activeDragId);
                    if (comp) {
                        const m = new THREE.Matrix4();
                        if (comp.matrix) m.fromArray(comp.matrix);
                        else m.setPosition(comp.position[0], comp.position[1], comp.position[2]);
                        m.setPosition(dragPos[0], m.elements[13], dragPos[2]);
                        commitChange(currentComponents.map(c => c.id === activeDragId ? { ...c, matrix: m.toArray() } : c));
                    }
                }
                setActiveDragId(null);
                setDragPos(null);
            }
          }}
          onPointerLeave={() => { 
            if (drawingWire) setDrawingWire(null); 
            if (activeDragId) {
                if (dragPos) {
                    const comp = currentComponents.find(c => c.id === activeDragId);
                    if (comp) {
                        const m = new THREE.Matrix4();
                        if (comp.matrix) m.fromArray(comp.matrix);
                        else m.setPosition(comp.position[0], comp.position[1], comp.position[2]);
                        m.setPosition(dragPos[0], m.elements[13], dragPos[2]);
                        commitChange(currentComponents.map(c => c.id === activeDragId ? { ...c, matrix: m.toArray() } : c));
                    }
                }
                setActiveDragId(null);
                setDragPos(null);
            }
          }}
        >
          <R3FCanvas camera={{ fov: 50 }} onPointerMissed={() => setActiveId(null)}>
            <CameraController view={view} />
            <Environment preset="city" />
            <ambientLight intensity={1.2} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -5]} intensity={0.8} color="#00ffcc" />
            
            <Suspense fallback={null}>
              <mesh 
                rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow side={THREE.DoubleSide}
                onPointerMove={(e) => { 
                  if (drawingWire) setDrawingWire(prev => prev ? { ...prev, currentPos: e.point.toArray() } : null); 
                  if (activeDragId) setDragPos(e.point.toArray());
                }}
              >
                <planeGeometry args={[40, 30]} />
                <meshStandardMaterial color="#e0e4e8" roughness={0.5} metalness={0.1} side={THREE.DoubleSide} />
                <gridHelper args={[40, 40, '#888888', '#aaaaaa']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} material-opacity={0.5} material-transparent />
              </mesh>

              {currentComponents.map((comp) => {
                const pot = currentComponents.find(x => x.type === 'Potentiometer');
                const potValue = pot ? (pot.data?.value !== undefined ? pot.data.value : 0.5) : 1.0;
                const voltage = voltageMap[comp.id] || 0;
                const signalType = signalMap[comp.id] || 'idle';
                return (
                  <DraggableModel 
                    key={comp.id} comp={comp} isActive={activeId === comp.id} isPowered={poweredIds.has(comp.id)} rpm={rpmMap[comp.id] || 0}
                    potValue={potValue} voltage={voltage} signalType={signalType}
                    isDragging={activeDragId === comp.id} dragPos={dragPos}
                    onClick={setActiveId} onCommit={(id, matrix) => commitChange(currentComponents.map(c => c.id === id ? { ...c, matrix } : c))}
                    onStartDrag={(id) => { setActiveId(id); setActiveDragId(id); setDragPos(null); }}
                    onStartWire={(id, pin, color) => { setActiveId(null); setDrawingWire({ sourceCompId: id, sourcePinId: pin, color, currentPos: null }); }} 
                    onEndWire={(targetCompId, targetPinId) => {
                      if (!drawingWire || drawingWire.sourceCompId === targetCompId) { setDrawingWire(null); return; }
                      const exists = currentWires.find(w => (w.sourceCompId === drawingWire.sourceCompId && w.sourcePinId === drawingWire.sourcePinId && w.targetCompId === targetCompId && w.targetPinId === targetPinId) || (w.targetCompId === drawingWire.sourceCompId && w.targetPinId === drawingWire.sourcePinId && w.sourceCompId === targetCompId && w.sourcePinId === targetPinId));
                      if (!exists) commitChange(currentComponents, [...currentWires, { id: `wire-${Date.now()}`, sourceCompId: drawingWire.sourceCompId, sourcePinId: drawingWire.sourcePinId, targetCompId, targetPinId, color: drawingWire.color || 'silver' }]);
                      setDrawingWire(null);
                    }}
                    onToggle={handleToggle}
                  />
                );
              })}

              {currentWires.map(wire => {
                const sourceComp = currentComponents.find(c => c.id === wire.sourceCompId);
                const targetComp = currentComponents.find(c => c.id === wire.targetCompId);
                if (!sourceComp || !targetComp) return null;
                const p1 = getPinWorldPos(sourceComp, wire.sourcePinId);
                const p2 = getPinWorldPos(targetComp, wire.targetPinId);
                
                const isMech = wire.sourcePinId.startsWith('shaft') && wire.targetPinId.startsWith('shaft');
                const midPoint = isMech ? [(p1[0]+p2[0])/2, Math.max(p1[1], p2[1]) + 0.5, (p1[2]+p2[2])/2] 
                                        : [(p1[0]+p2[0])/2, Math.max(p1[1], p2[1]) + 2, (p1[2]+p2[2])/2];

                if (isMech) {
                  const rpm = rpmMap[wire.sourceCompId] || rpmMap[wire.targetCompId] || 0;
                  return <MovingBelt key={wire.id} start={p1} end={p2} mid={midPoint} rpm={rpm} />;
                } else {
                  const isPowered = poweredIds.has(wire.sourceCompId) && poweredIds.has(wire.targetCompId);
                  return <MovingWire key={wire.id} start={p1} end={p2} mid={midPoint} color={wire.color} isPowered={isPowered} />;
                }
              })}

              {drawingWire && drawingWire.currentPos && (() => {
                const sourceComp = currentComponents.find(c => c.id === drawingWire.sourceCompId);
                if (!sourceComp) return null;
                const p1 = getPinWorldPos(sourceComp, drawingWire.sourcePinId);
                const p2 = drawingWire.currentPos;
                
                const isMech = drawingWire.sourcePinId.startsWith('shaft');
                const lineColor = isMech ? '#333333' : drawingWire.color;
                const lineWidth = isMech ? 8 : 4;
                const midPoint = isMech ? [(p1[0]+p2[0])/2, Math.max(p1[1], p2[1]) + 0.5, (p1[2]+p2[2])/2] 
                                        : [(p1[0]+p2[0])/2, Math.max(p1[1], p2[1]) + 2, (p1[2]+p2[2])/2];

                return <QuadraticBezierLine start={p1} end={p2} mid={midPoint} color={lineColor} lineWidth={lineWidth} dashed={isMech} dashScale={isMech ? 20 : 0} />;
              })()}
            </Suspense>
          </R3FCanvas>
        </div>

        <div className="status-text" style={{ zIndex: 2 }}>
          {currentComponents.length > 0 ? `STATE: ${historyIndex}/${history.length - 1} // ${drawingWire ? 'DRAWING WIRE...' : 'READY'}` : '3D ENGINE INITIALIZED'}
        </div>
      </div>
    </main>
  );
};

export default Canvas;
