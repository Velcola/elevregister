"use client";
import { useState, useEffect, useMemo } from "react";
import ParticlesBackground from "./components/ParticlesBackground";

type Elev = {
  id: number;
  navn: string;
  alder: string;
  skole: string;
  linje: string;
};

export default function Home() {
  const [elever, setElever] = useState<Elev[]>([]);
  const [navn, setNavn] = useState("");
  const [alder, setAlder] = useState("");
  const [skole, setSkole] = useState("");
  const [linje, setLinje] = useState("");

  const hentElever = async () => {
    try {
      const res = await fetch("http://localhost:5000/elever");
      const data = await res.json();
      setElever(data);
    } catch (err) {
      console.error("Feil ved henting av elever:", err);
    }
  };

  const leggTilElev = async () => {
    if (!navn || !alder || !skole || !linje) {
      return alert("Fyll ut alle feltene!");
    }

    const nyElev = { navn, alder, skole, linje };

    try {
      const res = await fetch("http://localhost:5000/elever", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nyElev),
      });

      const lagtTil = await res.json();
      setElever((prev) => [...prev, lagtTil]);
      setNavn("");
      setAlder("");
      setSkole("");
      setLinje("");
    } catch (err) {
      console.error("Feil ved lagring av elev:", err);
    }
  };

  const slettElev = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/elever/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setElever(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error("Feil ved sletting:", err);
    }
  };
  
  const oppdaterElev = async (id: number) => {
    const nyttNavn = prompt("Nytt navn:");
    const nyAlder = prompt("Ny alder:");
    const nySkole = prompt("Ny skole:");
    const nyLinje = prompt("Ny linje:");

    console.log(id);

    if (!nyttNavn || !nyAlder || !nySkole || !nyLinje) {
      return alert("Fyll ut alle feltene!");
    }

    try {
      const res = await fetch(`http://localhost:5000/elever`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          navn: nyttNavn,
          alder: nyAlder,
          skole: nySkole,
          linje: nyLinje,
        }),
      });

      const oppdatert = await res.json();
      setElever((prev) =>
        prev.map((e) => (e.id === id ? oppdatert : e))
      );
    } catch (err) {
      console.error("Feil ved oppdatering:", err);
    }
  };


  useEffect(() => {
    hentElever();
  }, []);

  const particlesMemo = useMemo(() => <ParticlesBackground />, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {particlesMemo}

      <div className="absolute top-1/2 left-1/2 transform flex justify-center flex-col -translate-x-1/2 -translate-y-1/2 z-10 
                      bg-white/5 text-white p-8 rounded-xl backdrop-blur-xl shadow-lg max-w-md w-11/12 text-center">
        <h1 className="text-3xl font-bold mb-4">Elevregister</h1>

        <div className="mb-2 flex space-x-2 justify-center">
          <input
            type="text"
            placeholder="Navn"
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            className="p-2 bg-white/10 backdrop-blur-lg rounded-xl w-1/2"
          />
          <input
            type="text"
            placeholder="Alder"
            value={alder}
            onChange={(e) => setAlder(e.target.value)}
            className="p-2 bg-white/10 backdrop-blur-lg rounded-xl w-1/2"
          />
        </div>
        <div className="flex space-x-2 justify-center mb-5">
          <input
            type="text"
            placeholder="Skole"
            value={skole}
            onChange={(e) => setSkole(e.target.value)}
            className="p-2 bg-white/10 backdrop-blur-lg rounded-xl w-1/2"
          />
          <input
            type="text"
            placeholder="Linje"
            value={linje}
            onChange={(e) => setLinje(e.target.value)}
            className="p-2 bg-white/10 backdrop-blur-lg rounded-xl w-1/2"
          />
        </div>
        
        <div className="flex flex-col space-y-3 justify-center w-full">
          <button
            onClick={leggTilElev}
            className="p-2 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/15"
          >
            Lagre
          </button>
          <button
            onClick={hentElever}
            className="p-2 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/15"
          >
            Hent Elever
          </button>
        </div>

        <div className="mt-6 text-left max-h-40 overflow-y-auto">
          {elever.map((elev) => (
            <div
              key={elev.id}
              className="mb-2 text-sm flex justify-between items-center bg-white/10 p-2 rounded"
            >
              <span>👤 {elev.navn}, {elev.alder} år, {elev.skole}, {elev.linje}</span>
              <div className="space-x-2">
                <button
                  onClick={() => oppdaterElev(elev.id)}
                  className="text-yellow-400 hover:underline"
                >
                  Rediger
                </button>
                <button
                  onClick={() => slettElev(elev.id)}
                  className="text-red-400 hover:underline"
                >
                  Slett
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
