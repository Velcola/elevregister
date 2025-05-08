"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; // Or loadFull if you want everything
import { loadFull } from "tsparticles"; // Or loadFull if you want everything
import type { Container } from "@tsparticles/engine";
import styles from "../page.module.css";

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine); // You can use loadFull if you need more features
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };
  

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: {
        color: "#202020",
      },
      particles: {
        number: { value: 50 },
        size: { value: 3 },
        move: { enable: true, speed: 1 },
        links: { enable: true, distance: 150, color: "#fff" },
      },
    }),
    []
  );

  if (!init) return null;

  return (
    <div className={styles.page}>
      <Particles
        className={styles.particles}
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    </div>
  );
};

export default ParticlesBackground;
