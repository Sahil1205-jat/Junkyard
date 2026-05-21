import React from 'react';
import { 
  Battery, Zap, Plug, Server, 
  ToggleLeft, Pointer, CircleDashed, Sun, GitCommit,
  Lightbulb, Minus, Volume2, Activity, Monitor,
  Settings, Repeat, Anchor, MoveVertical,
  Settings2, Baseline, Layers, Target, Combine, Cpu, Box, LayoutGrid
} from 'lucide-react';

const iconMap = {
  '9V Battery': <Battery size={20} color="var(--theme-blue)" />,
  'AA Battery Cell': <Battery size={20} color="var(--theme-blue)" />,
  'Bench Power Supply': <Server size={20} color="var(--theme-blue)" />,
  'Ground (GND)': <Baseline size={20} color="var(--theme-blue)" />,
  'Breadboard': <LayoutGrid size={20} color="var(--theme-blue)" />,
  
  'SPST Toggle Switch': <ToggleLeft size={20} color="var(--theme-red)" />,
  'Momentary Push Button': <Pointer size={20} color="var(--theme-red)" />,
  'Potentiometer': <CircleDashed size={20} color="var(--theme-red)" />,
  'Photoresistor (LDR)': <Sun size={20} color="var(--theme-red)" />,
  'Limit Switch': <GitCommit size={20} color="var(--theme-red)" />,
  
  'LED Diode': <Lightbulb size={20} color="var(--theme-black)" />,
  'Resistor': <Minus size={20} color="var(--theme-black)" />,
  'Piezo Buzzer': <Volume2 size={20} color="var(--theme-black)" />,
  'Multimeter': <Activity size={20} color="var(--theme-black)" />,
  'Oscilloscope': <Monitor size={20} color="var(--theme-black)" />,
  
  'DC Brushed Motor': <Repeat size={20} color="var(--theme-red)" />,
  'Continuous Servo': <Settings size={20} color="var(--theme-red)" />,
  'Positional Servo': <Target size={20} color="var(--theme-red)" />,
  'Linear Actuator': <MoveVertical size={20} color="var(--theme-red)" />,
  
  'Spur Gear': <Settings2 size={20} color="var(--theme-blue)" />,
  'Axle / Shaft': <Minus size={20} color="var(--theme-blue)" style={{ transform: 'rotate(45deg)' }} />,
  'Structural Beam': <Baseline size={20} color="var(--theme-blue)" />,
  'Scrap Plate': <Box size={20} color="var(--theme-blue)" />,
  'Wheel & Tire': <Target size={20} color="var(--theme-blue)" />,
  'Pulley & Belt': <Combine size={20} color="var(--theme-blue)" />,
  'PCB Board (Perfboard)': <Layers size={20} color="var(--theme-blue)" />,
  
  'Microcontroller Board': <Cpu size={20} color="var(--theme-black)" />,
  'IC Logic Gates': <Server size={20} color="var(--theme-black)" />,
  'H-Bridge Motor Driver': <Cpu size={20} color="var(--theme-black)" />
};

const ScrapHeap = () => {
  const inventory = [
    {
      category: 'Power Sources & Basics',
      icon: '🔋',
      items: ['9V Battery', 'AA Battery Cell', 'Bench Power Supply', 'Ground (GND)', 'Breadboard']
    },
    {
      category: 'Inputs & Controls',
      icon: '🎛️',
      items: ['SPST Toggle Switch', 'Momentary Push Button', 'Potentiometer', 'Photoresistor (LDR)', 'Limit Switch']
    },
    {
      category: 'Outputs & Loads',
      icon: '💡',
      items: ['LED Diode', 'Resistor', 'Piezo Buzzer', 'Multimeter', 'Oscilloscope']
    },
    {
      category: 'Actuators & Kinetics',
      icon: '⚙️',
      items: ['DC Brushed Motor', 'Continuous Servo', 'Positional Servo', 'Linear Actuator']
    },
    {
      category: 'Mechanical & Structural',
      icon: '🎡',
      items: ['Spur Gear', 'Axle / Shaft', 'Structural Beam', 'Scrap Plate', 'Wheel & Tire', 'Pulley & Belt', 'PCB Board (Perfboard)']
    },
    {
      category: 'Brains & Logic',
      icon: '🧠',
      items: ['Microcontroller Board', 'IC Logic Gates', 'H-Bridge Motor Driver']
    }
  ];

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('componentType', item);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="scrap-heap glass-panel">
      <h2>Scrap Inventory</h2>
      <div className="item-list">
        {inventory.map(group => (
          <div key={group.category} className="inventory-category">
            <h3 className="category-title">{group.icon} {group.category}</h3>
            {group.items.map(item => (
              <div 
                key={item} 
                className="scrap-item" 
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <div className="item-icon">
                  {iconMap[item] || <div />}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ScrapHeap;
