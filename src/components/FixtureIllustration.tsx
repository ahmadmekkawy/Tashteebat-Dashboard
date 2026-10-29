import React, { useId } from "react";
import { fixturePresets } from "../data/catalog";
export function FixtureIllustration({ type }: { type: string }) {
  const k = fixturePresets[type]?.kind || "spot";
  const gradient = `light-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <svg
      className="fixture-illustration"
      viewBox="0 0 180 110"
      role="img"
      aria-label={`${type} illustration`}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e6c387" stopOpacity=".5" />
          <stop offset="1" stopColor="#f7f0db" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M20 92h140" stroke="#dfe5d7" />
      {/chandelier/i.test(type) ? (
        <>
          <path
            d="M90 5v40m-35 5q35 32 70 0M90 40v27"
            fill="none"
            stroke="#aa9369"
            strokeWidth="3"
          />
          {[55, 90, 125].map((x, j) => (
            <g key={x}>
              <path d={`M${x} ${j === 1 ? 65 : 48}v-10`} stroke="#8a795b" />
              <circle cx={x} cy={j === 1 ? 72 : 52} r="8" fill="#e2c68e" />
              <circle
                cx={x}
                cy={j === 1 ? 72 : 52}
                r="16"
                fill="#e2c68e"
                opacity=".08"
              />
            </g>
          ))}
        </>
      ) : /table lamps|floor lamps/i.test(type) ? (
        <>
          <path d="M90 47v44m-18 0h36" stroke="#7c826d" strokeWidth="3" />
          <path d="M72 20h36l14 32H58z" fill="#bba98a" />
          <path d="M63 53h54l22 38H40z" fill={`url(#${gradient})`} />
        </>
      ) : /track/i.test(type) ? (
        <>
          <path d="M26 25h128" stroke="#68715e" strokeWidth="6" />
          {[52, 90, 128].map((x) => (
            <g key={x}>
              <path d={`M${x} 27v13`} stroke="#8f987e" strokeWidth="3" />
              <rect
                x={x - 8}
                y="38"
                width="16"
                height="17"
                rx="2"
                fill="#79836d"
              />
              <path
                d={`M${x - 6} 56h12l17 35h-46z`}
                fill={`url(#${gradient})`}
              />
              <path d={`M${x - 6} 54h12`} stroke="#d5b875" strokeWidth="2" />
            </g>
          ))}
        </>
      ) : /ground-recessed|floor lights/i.test(type) ? (
        <>
          <ellipse cx="90" cy="89" rx="21" ry="6" fill="#87917a" />
          <ellipse cx="90" cy="87" rx="14" ry="3" fill="#e2c68e" />
          <path
            d="M76 84h28l28-65H48z"
            fill={`url(#${gradient})`}
            opacity=".55"
          />
        </>
      ) : /cove/i.test(type) ? (
        <>
          <path
            d="M30 27h120M35 28v44h25v-8H43V28"
            fill="none"
            stroke="#9ba58e"
            strokeWidth="5"
          />
          <path d="M45 63h13l30-29H45z" fill="#e6cb9280" />
          <path d="M44 62h15" stroke="#c9ab6b" strokeWidth="3" />
          <path d="M50 29h93" stroke="#e3c68d" strokeWidth="5" opacity=".4" />
        </>
      ) : k === "linear" ? (
        <>
          <path d="M30 32h120l-12 10H42z" fill="#65725e" />
          <path d="M43 43h94l23 49H20z" fill={`url(#${gradient})`} />
          <path d="M43 41h94" stroke="#e0b66d" strokeWidth="3" />
          <path d="M50 20v12m80-12v12" stroke="#89917e" />
        </>
      ) : k === "pendant" ? (
        <>
          <path d="M90 5v30" stroke="#7d8673" strokeWidth="2" />
          <path d="M65 35h50l18 25H47z" fill="#b5a080" />
          <path d="M57 61h66l25 32H32z" fill={`url(#${gradient})`} />
          <path d="M50 60h80" stroke="#e1bc77" strokeWidth="3" />
        </>
      ) : k === "ground" ? (
        <>
          <path d="M83 35h14v57H83z" fill="#65725e" />
          <path d="M78 29h24v13H78z" fill="#7e8870" />
          <path d="M79 42h23l30 50H48z" fill={`url(#${gradient})`} />
          <path d="M80 41h20" stroke="#e1bc77" strokeWidth="3" />
        </>
      ) : k === "wall" ? (
        <>
          <path d="M80 15v78" stroke="#d9dfd0" strokeWidth="4" />
          <rect x="81" y="35" width="18" height="24" rx="3" fill="#7c8870" />
          <path d="M83 60h14l27 33H55z" fill={`url(#${gradient})`} />
          <path d="M83 34h14l18-25H64z" fill="#eddfb733" />
        </>
      ) : (
        <>
          <path d="M30 23h120" stroke="#d5ddcb" strokeWidth="3" />
          <ellipse cx="90" cy="30" rx="24" ry="8" fill="#6e7b63" />
          <path d="M70 34h40l37 58H33z" fill={`url(#${gradient})`} />
          <ellipse cx="90" cy="34" rx="17" ry="4" fill="#e4c58a" />
        </>
      )}
    </svg>
  );
}
