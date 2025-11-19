import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Aquifer3DVisualization = ({ data }) => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f8ff); // Light blue background
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Create coordinate axes for reference
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Create aquifer layers with different materials
    const createLayer = (depth, thickness, color, name, opacity = 1.0) => {
      const geometry = new THREE.BoxGeometry(8, thickness, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color, 
        transparent: opacity < 1.0,
        opacity,
        side: THREE.DoubleSide
      });
      const layer = new THREE.Mesh(geometry, material);
      layer.position.y = -depth - (thickness / 2);
      layer.name = name;
      layer.userData = { depth, thickness, name };
      return layer;
    };
    
    // Calculate layer parameters based on water level
    const waterLevel = data.currentLevel;
    
    // Add ground surface (green)
    const surfaceGeometry = new THREE.PlaneGeometry(12, 12);
    const surfaceMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x7CFC00, // Lawn green
      side: THREE.DoubleSide 
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0.05;
    surface.name = "Ground Surface";
    scene.add(surface);
    
    // Add top soil layer (brown)
    const topSoilLayer = createLayer(0.5, 1, 0xD2B48C, "Top Soil", 0.9);
    scene.add(topSoilLayer);
    
    // Add clay layer (reddish brown)
    const clayLayer = createLayer(2, 1.5, 0xBC8F8F, "Clay Layer", 0.8);
    scene.add(clayLayer);
    
    // Add sand/gravel aquifer layer (yellowish)
    const aquiferLayer = createLayer(4, 3, 0xFFD700, "Aquifer", 0.7);
    scene.add(aquiferLayer);
    
    // Add water table (blue transparent plane)
    const waterGeometry = new THREE.PlaneGeometry(10, 10);
    const waterMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1E90FF, 
      transparent: true, 
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const waterTable = new THREE.Mesh(waterGeometry, waterMaterial);
    waterTable.rotation.x = -Math.PI / 2;
    waterTable.position.y = -waterLevel;
    waterTable.name = `Water Table (${waterLevel.toFixed(1)}m)`;
    scene.add(waterTable);
    
    // Add bedrock layer (gray)
    const bedrockLayer = createLayer(8, 4, 0xA9A9A9, "Bedrock", 0.9);
    scene.add(bedrockLayer);
    
    // Add markers for historical levels
    data.historicalLevels.forEach((level, index) => {
      if (index % 2 === 0) { // Add markers for every other year
        const markerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const markerMaterial = new THREE.MeshPhongMaterial({ 
          color: level < waterLevel ? 0x00FF00 : 0xFF0000 // Green if improving, red if worsening
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        // Position markers in a circular pattern around the center
        const angle = (index / data.historicalLevels.length) * Math.PI * 2;
        const radius = 3;
        
        marker.position.set(
          Math.cos(angle) * radius,
          -level,
          Math.sin(angle) * radius
        );
        
        // Add year label (as a simple cube for now)
        const yearLabel = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 0.3),
          new THREE.MeshBasicMaterial({ color: 0x0000FF })
        );
        yearLabel.position.set(
          Math.cos(angle) * (radius + 0.5),
          -level,
          Math.sin(angle) * (radius + 0.5)
        );
        
        scene.add(marker);
        scene.add(yearLabel);
      }
    });
    
    // Add a well representation
    const wellGeometry = new THREE.CylinderGeometry(0.2, 0.2, waterLevel, 16);
    const wellMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const well = new THREE.Mesh(wellGeometry, wellMaterial);
    well.position.y = -waterLevel / 2;
    well.position.x = 2;
    well.position.z = 2;
    scene.add(well);
    
    // Add water in the well
    const wellWaterGeometry = new THREE.CylinderGeometry(0.15, 0.15, waterLevel, 16);
    const wellWaterMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1E90FF,
      transparent: true,
      opacity: 0.7
    });
    const wellWater = new THREE.Mesh(wellWaterGeometry, wellWaterMaterial);
    wellWater.position.y = -waterLevel / 2;
    wellWater.position.x = 2;
    wellWater.position.z = 2;
    scene.add(wellWater);
    
    // Position camera
    camera.position.set(10, 5, 12);
    camera.lookAt(0, -5, 0);
    
    // Add orbit controls for interactive rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Add grid helper for scale reference
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x888888);
    gridHelper.position.y = -10;
    scene.add(gridHelper);
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    setIsLoading(false);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [data]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#333',
          textAlign: 'center'
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading 3D visualization...</p>
        </div>
      )}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.3s ease-in'
        }} 
      />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        pointerEvents: 'none'
      }}>
        <div>💧 Water Table: {data.currentLevel.toFixed(1)}m deep</div>
        <div>🏔️ Ground Surface</div>
        <div>🟤 Soil & Clay Layers</div>
        <div>🟡 Aquifer Layer</div>
        <div>⚫ Bedrock</div>
        <div style={{ marginTop: '5px', fontSize: '10px' }}>
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
};

export default Aquifer3DVisualization;