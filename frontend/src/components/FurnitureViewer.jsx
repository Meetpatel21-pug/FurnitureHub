import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import './FurnitureViewer.css';

const backendBaseUrl = 'http://127.0.0.1:8000';

const resolveMediaUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${backendBaseUrl}${value}`;
};

const Loader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="furniture-viewer-loading-card">
        <div
          className="spinner-border text-info mb-3"
          role="status"
          aria-label="Loading 3D model"
        />
        <div className="fw-semibold text-dark mb-1">Loading model</div>
        <div className="text-muted small">{Math.round(progress)}% loaded</div>
      </div>
    </Html>
  );
};

/* -------------------------------------------------------
   Camera fit helper
   Makes model visible by default with slight zoom-out
-------------------------------------------------------- */
const FitCameraToObject = ({ targetRef, controlsRef, zoomOut = 1.18 }) => {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!targetRef.current) return;

    const object = targetRef.current;
    const box = new THREE.Box3().setFromObject(object);

    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const boxSize = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const fov = THREE.MathUtils.degToRad(camera.fov);

    // distance required to fit object in camera
    let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));

    // slight zoom-out like your second screenshot
    cameraZ *= zoomOut;

    camera.position.set(
      center.x,
      center.y + boxSize.y * 0.08,
      center.z + cameraZ
    );

    camera.near = 0.1;
    camera.far = Math.max(100, maxDim * 20);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(
        center.x,
        center.y + boxSize.y * 0.1,
        center.z
      );

      // allow zoom in / zoom out
      controlsRef.current.minDistance = Math.max(maxDim * 0.6, 1.5);
      controlsRef.current.maxDistance = Math.max(maxDim * 4, 18);
      controlsRef.current.update();
    }
  }, [camera, size, targetRef, controlsRef, zoomOut]);

  return null;
};

/* -------------------------------------------------------
   GLB furniture model
-------------------------------------------------------- */
const FurnitureModel = ({ url, controlsRef }) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef();

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!groupRef.current) return;

    const root = groupRef.current;

    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.needsUpdate = true;
          child.material.envMapIntensity = 1.1;
        }
      }
    });

    // reset transforms
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    root.scale.set(1, 1, 1);

    // center model and place it on the floor
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());

    root.position.x = -center.x;
    root.position.y = -box.min.y;
    root.position.z = -center.z;
  }, [clonedScene]);

  return (
    <>
      <group ref={groupRef}>
        <primitive object={clonedScene} dispose={null} />
      </group>

      {/* Default view slightly zoomed out */}
      <FitCameraToObject
        targetRef={groupRef}
        controlsRef={controlsRef}
        zoomOut={1.18}
      />
    </>
  );
};

/* -------------------------------------------------------
   Procedural fallback furniture
-------------------------------------------------------- */
const Part = ({ position, scale, color, roughness = 0.68 }) => (
  <mesh position={position} scale={scale} castShadow receiveShadow>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.08}
    />
  </mesh>
);

const ProceduralFurniture = ({ category = '', name = '', controlsRef }) => {
  const groupRef = useRef();
  const type = `${category} ${name}`.toLowerCase();

  const wood = '#9a6a3f';
  const darkWood = '#5b3a25';
  const fabric = '#2563eb';
  const accent = '#e2e8f0';

  let content;

  if (type.includes('bed')) {
    content = (
      <>
        <Part position={[0, 0.15, 0]} scale={[2.9, 0.28, 1.8]} color={darkWood} />
        <Part position={[0, 0.45, 0]} scale={[2.65, 0.28, 1.62]} color={accent} />
        <Part position={[0, 0.68, -0.58]} scale={[2.5, 0.16, 0.52]} color={fabric} />
        <Part position={[0, 0.72, -1]} scale={[3.05, 1.2, 0.18]} color={wood} />
        <Part position={[-0.75, 0.9, -0.48]} scale={[0.68, 0.18, 0.42]} color="#f8fafc" />
        <Part position={[0.75, 0.9, -0.48]} scale={[0.68, 0.18, 0.42]} color="#f8fafc" />
      </>
    );
  } else if (type.includes('table') || type.includes('desk')) {
    content = (
      <>
        <Part position={[0, 1, 0]} scale={[2.6, 0.18, 1.35]} color={wood} />
        <Part position={[-1.08, 0.45, -0.48]} scale={[0.18, 0.9, 0.18]} color={darkWood} />
        <Part position={[1.08, 0.45, -0.48]} scale={[0.18, 0.9, 0.18]} color={darkWood} />
        <Part position={[-1.08, 0.45, 0.48]} scale={[0.18, 0.9, 0.18]} color={darkWood} />
        <Part position={[1.08, 0.45, 0.48]} scale={[0.18, 0.9, 0.18]} color={darkWood} />
      </>
    );
  } else if (type.includes('chair') || type.includes('stool')) {
    content = (
      <>
        <Part position={[0, 0.85, 0]} scale={[1.35, 0.2, 1.2]} color={fabric} />
        <Part position={[0, 1.45, -0.5]} scale={[1.35, 1.05, 0.2]} color={fabric} />
        <Part position={[-0.5, 0.4, -0.38]} scale={[0.16, 0.8, 0.16]} color={darkWood} />
        <Part position={[0.5, 0.4, -0.38]} scale={[0.16, 0.8, 0.16]} color={darkWood} />
        <Part position={[-0.5, 0.4, 0.38]} scale={[0.16, 0.8, 0.16]} color={darkWood} />
        <Part position={[0.5, 0.4, 0.38]} scale={[0.16, 0.8, 0.16]} color={darkWood} />
      </>
    );
  } else if (type.includes('wardrobe') || type.includes('closet') || type.includes('shelf')) {
    content = (
      <>
        <Part position={[0, 1.15, 0]} scale={[1.85, 2.3, 0.48]} color={wood} />
        <Part position={[0, 1.15, 0.27]} scale={[0.06, 2.05, 0.06]} color={darkWood} />
        <Part position={[0, 1.55, 0.31]} scale={[1.55, 0.08, 0.08]} color={darkWood} />
        <Part position={[0, 0.8, 0.31]} scale={[1.55, 0.08, 0.08]} color={darkWood} />
      </>
    );
  } else {
    // sofa fallback
    content = (
      <>
        <Part position={[0, 0.68, 0]} scale={[2.4, 0.34, 1.25]} color={fabric} />
        <Part position={[0, 1.18, -0.48]} scale={[2.4, 1, 0.26]} color={fabric} />
        <Part position={[-1.28, 0.92, 0]} scale={[0.32, 0.78, 1.28]} color={fabric} />
        <Part position={[1.28, 0.92, 0]} scale={[0.32, 0.78, 1.28]} color={fabric} />
        <Part position={[-0.74, 0.28, 0.42]} scale={[0.18, 0.56, 0.18]} color={darkWood} />
        <Part position={[0.74, 0.28, 0.42]} scale={[0.18, 0.56, 0.18]} color={darkWood} />
      </>
    );
  }

  return (
    <>
      <group ref={groupRef}>{content}</group>
      <FitCameraToObject
        targetRef={groupRef}
        controlsRef={controlsRef}
        zoomOut={1.12}
      />
    </>
  );
};

const FurnitureViewer = ({
  name,
  modelUrl,
  category,
  posterUrl,
  fallbackImage,
  className = '',
}) => {
  const resolvedModelUrl = useMemo(() => resolveMediaUrl(modelUrl), [modelUrl]);
  const resolvedPosterUrl = useMemo(
    () => resolveMediaUrl(posterUrl || fallbackImage),
    [posterUrl, fallbackImage]
  );

  const controlsRef = useRef();

  return (
    <div className={`furniture-viewer-shell ${className}`}>
      <Canvas
        className="furniture-viewer-canvas"
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.1, 6], fov: 32, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#f8fafc']} />

        <ambientLight intensity={0.95} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={1.45}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight
          position={[-4, 8, 4]}
          angle={THREE.MathUtils.degToRad(26)}
          penumbra={0.75}
          intensity={1.05}
          castShadow
        />

        <Suspense fallback={<Loader />}>
          {resolvedModelUrl ? (
            <FurnitureModel url={resolvedModelUrl} controlsRef={controlsRef} />
          ) : (
            <ProceduralFurniture
              category={category}
              name={name}
              controlsRef={controlsRef}
            />
          )}

          <Environment preset="warehouse" background={false} />

          <ContactShadows
            position={[0, -0.02, 0]}
            opacity={0.25}
            scale={18}
            blur={2.2}
            far={10}
            resolution={1024}
            color="#0f172a"
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.35}
          minDistance={1.5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>

      <div className="furniture-viewer-badge">
        {resolvedModelUrl ? '3D furniture viewer' : 'Generated 3D preview'}
      </div>

      <div className="furniture-viewer-caption">
        Drag to rotate, scroll to zoom
      </div>

      {!resolvedModelUrl && resolvedPosterUrl && (
        <img
          src={resolvedPosterUrl}
          alt=""
          className="furniture-viewer-reference"
        />
      )}
    </div>
  );
};

export default FurnitureViewer;