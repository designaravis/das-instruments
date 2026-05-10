export interface VariantOption {
  label: string;
  price: number;
}

export interface ProductVariantGroup {
  name: string;
  options: (string | VariantOption)[];
}

export interface Product {
  id: string;
  category: string;
  name: string;
  icon: string;
  imageUrl?: string;
  price: number;
  desc: string;
  specs: Record<string, string>;
  tags: string[];
  inStock: boolean;
  variantGroups?: ProductVariantGroup[];
  actionType?: 'cart' | 'enquiry';
}

export const PRODUCTS: Product[] = [
  { id: 'p1', category: 'electrochemical', name: 'Potentiostat/Galvanostat EW-1000', icon: '⚗️', price: 285000, desc: 'High-precision electrochemical workstation with EIS capability. Supports cyclic voltammetry, impedance spectroscopy, and 20+ techniques.', specs: { 'Voltage Range': '±10V', 'Current Range': '10nA – 2A', 'EIS Frequency': '0.001Hz – 1MHz', 'Channels': 'Single', 'Software': 'EC-Lab Compatible' }, tags: ['EIS', 'CV', 'CA', 'OCP'], inStock: true },
  { id: 'p2', category: 'electrochemical', name: 'Multi-Channel EW-4CH', icon: '⚗️', price: 580000, desc: '4-channel simultaneous electrochemical workstation for battery and fuel cell research. Independent FPGA control per channel.', specs: { 'Channels': '4 Independent', 'Voltage Range': '±5V', 'Current': '100pA – 5A', 'Data Rate': '10 MS/s', 'Interface': 'USB 3.0' }, tags: ['Multi-CH', 'Battery', 'Research'], inStock: true },
  { id: 'p3', category: 'lab', name: 'Digital pH Meter DPH-500', icon: '🔬', price: 18500, desc: 'Laboratory-grade pH meter with ATC and 5-point calibration. GLP compliant with data logging capability.', specs: { 'Range': '0.00–14.00 pH', 'Resolution': '0.001 pH', 'Accuracy': '±0.002 pH', 'ATC': 'Yes', 'Display': 'LCD Backlit' }, tags: ['pH', 'ATC', 'GLP'], inStock: true },
  { id: 'p4', category: 'lab', name: 'Conductivity Meter CM-300', icon: '🔬', price: 24000, desc: 'Precision conductivity/TDS/salinity meter with temperature compensation. Ideal for water quality analysis.', specs: { 'Range': '0.01µS/cm – 500mS/cm', 'Resolution': '0.01µS/cm', 'ATC': '0–60°C', 'Display': 'Dual LCD', 'Memory': '500 records' }, tags: ['Conductivity', 'TDS', 'Water Quality'], inStock: true },
  { id: 'p5', category: 'controllers', name: 'PID Temperature Controller TC-700', icon: '🎛️', price: 8500, desc: 'Auto-tuning PID controller for precise industrial temperature control. DIN rail mountable with RS485 communication.', specs: { 'Input': 'Thermocouple/RTD', 'Output': 'Relay/SSR/4-20mA', 'Accuracy': '±0.2%', 'Display': '4-digit LED', 'Protocol': 'Modbus RTU' }, tags: ['PID', 'Modbus', 'DIN Rail'], inStock: true },
  { id: 'p6', category: 'controllers', name: 'Programmable Logic Controller PLC-200', icon: '🎛️', price: 45000, desc: 'Compact PLC with 32 I/O points, Ethernet connectivity, and ladder/function block programming. Industrial grade IP54.', specs: { 'I/O Points': '32 (16DI+16DO)', 'CPU': 'ARM Cortex-M4', 'Comm': 'Ethernet+RS485', 'Programming': 'IEC 61131-3', 'Memory': '256KB' }, tags: ['PLC', 'Ethernet', 'Automation'], inStock: true },
  { id: 'p7', category: 'pyrometer', name: 'Infrared Pyrometer IR-800', icon: '🌡️', price: 32000, desc: 'Non-contact infrared thermometer for high-temperature industrial measurement. Fast response with laser targeting.', specs: { 'Range': '-50°C to 800°C', 'Accuracy': '±1°C or ±1%', 'Response': '150ms', 'Emissivity': '0.1–1.0', 'Output': '4-20mA' }, tags: ['Non-Contact', 'Industrial', 'IR'], inStock: true },
  { id: 'p8', category: 'recorder', name: 'Paperless Data Recorder DR-12', icon: '📊', price: 55000, desc: '12-channel paperless recorder with color TFT display and SD card logging. Web-based remote monitoring.', specs: { 'Channels': '12', 'Display': '7" TFT Color', 'Memory': 'SD Card 32GB', 'Protocol': 'Modbus/Ethernet', 'Sampling': '1000ms' }, tags: ['Paperless', 'Ethernet', '12-CH'], inStock: true },
  { id: 'p9', category: 'thyristor', name: 'Thyristor Power Controller TPC-50A', icon: '⚡', price: 28000, desc: '50A phase-angle and zero-cross thyristor power controller. Self-protecting design with heat-sink.', specs: { 'Rating': '50A / 240VAC', 'Control': 'Phase Angle/Zero Cross', 'Input': '4-20mA / 0-10V', 'Protection': 'OVP/OTP/SCR', 'Cooling': 'Natural Convection' }, tags: ['SCR', 'Phase Control', '50A'], inStock: true },
  { id: 'p10', category: 'fuel-cell', name: 'Fuel Cell Test System FC-500', icon: '🔋', price: 420000, desc: 'Complete PEM fuel cell testing station with temperature, humidity, and flow control. Integrated impedance spectroscopy.', specs: { 'Power Range': '0–500W', 'Temp Control': '20–90°C', 'Flow': '0–5 slpm H2/Air', 'EIS': 'Built-in', 'Safety': 'Explosion-proof' }, tags: ['PEM', 'H2', 'EIS'], inStock: true },
  { id: 'p11', category: 'battery', name: 'Battery Analyzer BA-8CH', icon: '🪫', price: 185000, desc: '8-channel battery testing system for cycle life, rate capability, and impedance testing. Per-channel FPGA control.', specs: { 'Channels': '8 Independent', 'Voltage': '0–5V', 'Current': '0–10A', 'Accuracy': '0.02% FS', 'Software': 'BTS-Pro' }, tags: ['8-CH', 'Cycle Life', 'CCCV'], inStock: false },
  { id: 'p12', category: 'pyrometer', name: 'Two-Color Pyrometer 2C-1200', icon: '🌡️', price: 68000, desc: 'Ratio pyrometer for accurate measurement independent of emissivity. For steel, glass, and refractory applications.', specs: { 'Range': '600°C to 1200°C', 'Emissivity': 'Auto-ratio', 'Accuracy': '±0.5%', 'Response': '10ms', 'Output': 'Analog + RS485' }, tags: ['Ratio', 'Steel', '1200°C'], inStock: true },
];
