import type { CSSProperties } from "react";

const petals = [
  ["3vw", "-18vw", "13.4s", "-8.2s", "0.78", "0.74", "-22deg", "326deg"],
  ["10vw", "14vw", "16.8s", "-2.9s", "0.62", "0.62", "18deg", "382deg"],
  ["17vw", "-9vw", "14.7s", "-11.8s", "0.9", "0.7", "-36deg", "298deg"],
  ["24vw", "20vw", "18.4s", "-5.6s", "0.68", "0.58", "12deg", "410deg"],
  ["31vw", "-15vw", "15.2s", "-10.4s", "0.84", "0.73", "-48deg", "312deg"],
  ["39vw", "11vw", "17.6s", "-1.7s", "0.58", "0.56", "27deg", "396deg"],
  ["47vw", "-22vw", "13.9s", "-6.9s", "0.76", "0.68", "-16deg", "339deg"],
  ["55vw", "16vw", "19.1s", "-13.1s", "0.66", "0.6", "35deg", "425deg"],
  ["63vw", "-12vw", "15.8s", "-4.1s", "0.94", "0.76", "-31deg", "305deg"],
  ["70vw", "18vw", "17.1s", "-9.8s", "0.6", "0.57", "23deg", "402deg"],
  ["77vw", "-17vw", "14.4s", "-3.5s", "0.81", "0.71", "-41deg", "320deg"],
  ["84vw", "13vw", "18.7s", "-12.3s", "0.7", "0.6", "9deg", "390deg"],
  ["91vw", "-20vw", "16.2s", "-7.4s", "0.88", "0.74", "-28deg", "336deg"],
  ["97vw", "9vw", "13.6s", "-0.8s", "0.57", "0.55", "31deg", "415deg"],
  ["105vw", "-14vw", "18.1s", "-14.2s", "0.72", "0.64", "-12deg", "347deg"],
  ["-4vw", "17vw", "15.5s", "-6.1s", "0.64", "0.59", "21deg", "404deg"]
] as const;

export function SakuraFall() {
  return (
    <div className="sakura-fall" aria-hidden="true">
      {petals.map(([left, drift, duration, delay, scale, opacity, startTurn, endTurn], index) => (
        <i
          className="sakura-fall-petal"
          key={index}
          style={{
            "--sakura-left": left,
            "--sakura-drift": drift,
            "--sakura-duration": duration,
            "--sakura-delay": delay,
            "--sakura-scale": scale,
            "--sakura-opacity": opacity,
            "--sakura-start-turn": startTurn,
            "--sakura-end-turn": endTurn
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
