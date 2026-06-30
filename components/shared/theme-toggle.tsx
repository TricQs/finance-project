"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <div
        /* Efek hover zoom telah dihapus sesuai permintaan */
        className="mode-tog drop-shadow-md"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <svg
          viewBox="0 0 200 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Filter Night */}
            <filter id="filter0_i_1_1015" x="0" y="0" width="200" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect1_innerShadow_1_1015" />
              <feOffset dy="6" />
              <feGaussianBlur stdDeviation="4" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_1015" />
            </filter>
            
            {/* Filter Day */}
            <filter id="filter0_i_1_1078" x="0" y="0" width="200" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect1_innerShadow_1_1078" />
              <feOffset dy="6" />
              <feGaussianBlur stdDeviation="4" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_1078" />
            </filter>

            {/* Filter Knob Drop Shadow */}
            <filter id="filter0_d_1_839" x="0" y="0" width="82" height="82" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="2" dy="1" />
              <feGaussianBlur stdDeviation="3" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_839" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_839" result="shape" />
            </filter>

            {/* Gradients Night */}
            <linearGradient id="paint0_linear_1_1015" x1="100" y1="0" x2="100" y2="90" gradientUnits="userSpaceOnUse"><stop stopColor="#364BBA" /><stop offset="1" stopColor="#A979D9" /></linearGradient>
            <linearGradient id="paint1_linear_1_1015" x1="100" y1="0" x2="100" y2="90" gradientUnits="userSpaceOnUse"><stop stopColor="#ABFAFF" /><stop offset="1" stopColor="#D5FFAB" /></linearGradient>
            <linearGradient id="paint2_linear_1_1015" x1="138" y1="15.5" x2="138" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0.261829" stopColor="#A5C5EB" /><stop offset="0.699362" stopColor="#51EAFF" stopOpacity="0" /></linearGradient>
            <linearGradient id="paint3_linear_1_1015" x1="106.25" y1="41" x2="106.25" y2="137.519" gradientUnits="userSpaceOnUse"><stop stopColor="#6A86EB" /><stop offset="0.553516" stopColor="#010203" /></linearGradient>
            <linearGradient id="paint8_linear_1_1015" x1="40.5" y1="68" x2="40.5" y2="106" gradientUnits="userSpaceOnUse"><stop stopColor="#111F51" /><stop offset="1" stopColor="#83459F" stopOpacity="0" /></linearGradient>
            
            {/* Gradients Day */}
            <linearGradient id="paint0_linear_1_1078" x1="100" y1="0" x2="100" y2="90" gradientUnits="userSpaceOnUse"><stop stopColor="#ABFAFF" /><stop offset="1" stopColor="#D5FFAB" /></linearGradient>
            <linearGradient id="paint1_linear_1_1078" x1="100" y1="0" x2="100" y2="90" gradientUnits="userSpaceOnUse"><stop stopColor="#ABFAFF" /><stop offset="1" stopColor="#D5FFAB" /></linearGradient>
            <linearGradient id="paint2_linear_1_1078" x1="58" y1="13.5" x2="58" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0.370713" stopColor="#F6F061" /><stop offset="0.699362" stopColor="#61EDF6" stopOpacity="0" /></linearGradient>
            <linearGradient id="paint3_linear_1_1078" x1="106.25" y1="41" x2="106.25" y2="137.519" gradientUnits="userSpaceOnUse"><stop stopColor="#9FDEF2" /><stop offset="0.553516" stopColor="#A8FFAC" /></linearGradient>
            <linearGradient id="paint8_linear_1_1078" x1="40.5" y1="68" x2="40.5" y2="106" gradientUnits="userSpaceOnUse"><stop stopColor="#236B70" /><stop offset="1" stopColor="#519DA2" stopOpacity="0" /></linearGradient>
            <linearGradient id="paint30_linear_1_1078" x1="116.5" y1="7" x2="116.5" y2="13.8605" gradientUnits="userSpaceOnUse"><stop stopColor="#A8E0FF" /><stop offset="1" stopColor="#7FE0FF" stopOpacity="0" /></linearGradient>
            
            {/* Gradient Knob */}
            <linearGradient id="paint0_linear_1_839" x1="39" y1="5" x2="39" y2="75" gradientUnits="userSpaceOnUse"><stop stopColor="white" /><stop offset="1" stopColor="#E8EAEA" /></linearGradient>
          </defs>

          <motion.g 
            initial={{ opacity: isDark ? 0 : 1 }} 
            animate={{ opacity: isDark ? 0 : 1 }} 
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <g filter="url(#filter0_i_1_1078)">
              <rect width="200" height="90" rx="45" fill="url(#paint0_linear_1_1078)"/>
            </g>
            <mask id="mask0_1_1078" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="90">
              <rect width="200" height="90" rx="45" fill="url(#paint1_linear_1_1078)"/>
            </mask>
            <g mask="url(#mask0_1_1078)">
              <circle cx="58" cy="39" r="21" fill="url(#paint2_linear_1_1078)"/>
              <path d="M-4 54.5V69.5L4.5 109C19.6667 114.5 51.1 125.8 55.5 127C61 128.5 109.5 136.5 112 137.5C114 138.3 182.5 113.167 216.5 100.5L205.5 58.5L161.5 51.5L117.5 47.5L101 49.5L75.5 41L-4 54.5Z" fill="url(#paint3_linear_1_1078)"/>
              <path d="M40.0095 70.4835C40.1156 69.946 40.8844 69.946 40.9905 70.4835L46.0113 95.9031C46.0723 96.2122 45.8358 96.5 45.5207 96.5H35.4793C35.1642 96.5 34.9277 96.2122 34.9887 95.9031L40.0095 70.4835Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M48.0125 75.1391C48.1307 74.6206 48.8693 74.6206 48.9875 75.1391L54.8559 100.889C54.9272 101.202 54.6894 101.5 54.3684 101.5H42.6316C42.3106 101.5 42.0728 101.202 42.1441 100.889L48.0125 75.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M64.0125 73.1391C64.1307 72.6206 64.8693 72.6206 64.9875 73.1391L70.8559 98.8889C70.9272 99.2019 70.6894 99.5 70.3684 99.5H58.6316C58.3106 99.5 58.0728 99.2019 58.1441 98.8889L64.0125 73.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M87.0125 73.1391C87.1307 72.6206 87.8693 72.6206 87.9875 73.1391L93.8559 98.8889C93.9272 99.2019 93.6894 99.5 93.3684 99.5H81.6316C81.3106 99.5 81.0728 99.2019 81.1441 98.8889L87.0125 73.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M105.012 72.1391C105.131 71.6206 105.869 71.6206 105.988 72.1391L111.856 97.8889C111.927 98.2019 111.689 98.5 111.368 98.5H99.6316C99.3106 98.5 99.0728 98.2019 99.1441 97.8889L105.012 72.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M123.012 73.1391C123.131 72.6206 123.869 72.6206 123.988 73.1391L129.856 98.8889C129.927 99.2019 129.689 99.5 129.368 99.5H117.632C117.311 99.5 117.073 99.2019 117.144 98.8889L123.012 73.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M147.012 75.1391C147.131 74.6206 147.869 74.6206 147.988 75.1391L153.856 100.889C153.927 101.202 153.689 101.5 153.368 101.5H141.632C141.311 101.5 141.073 101.202 141.144 100.889L147.012 75.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M163.012 73.1391C163.131 72.6206 163.869 72.6206 163.988 73.1391L169.856 98.8889C169.927 99.2019 169.689 99.5 169.368 99.5H157.632C157.311 99.5 157.073 99.2019 157.144 98.8889L163.012 73.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path d="M179.012 69.1391C179.131 68.6206 179.869 68.6206 179.988 69.1391L185.856 94.8889C185.927 95.2019 185.689 95.5 185.368 95.5H173.632C173.311 95.5 173.073 95.2019 173.144 94.8889L179.012 69.1391Z" fill="url(#paint8_linear_1_1078)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M127 13.8605H106C106.252 11.9249 107.907 10.4302 109.912 10.4302C110.066 10.4302 110.219 10.4391 110.369 10.4564C111.374 8.40919 113.48 7 115.914 7C118.682 7 121.024 8.82039 121.808 11.329C122.22 11.191 122.66 11.1163 123.118 11.1163C124.91 11.1163 126.435 12.2617 127 13.8605Z" fill="url(#paint30_linear_1_1078)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M125 38.3943H84C84.4922 34.6154 87.7237 31.6971 91.6368 31.6971C91.9388 31.6971 92.2367 31.7145 92.5297 31.7483C94.4924 27.7513 98.6033 25 103.357 25C108.759 25 113.332 28.5541 114.864 33.4518C115.667 33.1825 116.527 33.0366 117.421 33.0366C120.92 33.0366 123.897 35.2729 125 38.3943Z" fill="url(#paint30_linear_1_1078)"/>
            </g>
          </motion.g>

          <motion.g 
            initial={{ opacity: isDark ? 1 : 0 }} 
            animate={{ opacity: isDark ? 1 : 0 }} 
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <g filter="url(#filter0_i_1_1015)">
              <rect width="200" height="90" rx="45" fill="url(#paint0_linear_1_1015)"/>
            </g>
            <mask id="mask0_1_1015" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="90">
              <rect width="200" height="90" rx="45" fill="url(#paint1_linear_1_1015)"/>
            </mask>
            <g mask="url(#mask0_1_1015)">
              <circle cx="138" cy="41" r="21" fill="url(#paint2_linear_1_1015)"/>
              <path d="M-4 54.5V69.5L4.5 109C19.6667 114.5 51.1 125.8 55.5 127C61 128.5 109.5 136.5 112 137.5C114 138.3 182.5 113.167 216.5 100.5L205.5 58.5L161.5 51.5L117.5 47.5L101 49.5L75.5 41L-4 54.5Z" fill="url(#paint3_linear_1_1015)"/>
              <path d="M40.0095 70.4835C40.1156 69.946 40.8844 69.946 40.9905 70.4835L46.0113 95.9031C46.0723 96.2122 45.8358 96.5 45.5207 96.5H35.4793C35.1642 96.5 34.9277 96.2122 34.9887 95.9031L40.0095 70.4835Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M48.0125 75.1391C48.1307 74.6206 48.8693 74.6206 48.9875 75.1391L54.8559 100.889C54.9272 101.202 54.6894 101.5 54.3684 101.5H42.6316C42.3106 101.5 42.0728 101.202 42.1441 100.889L48.0125 75.1391Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M64.0125 73.1391C64.1307 72.6206 64.8693 72.6206 64.9875 73.1391L70.8559 98.8889C70.9272 99.2019 70.6894 99.5 70.3684 99.5H58.6316C58.3106 99.5 58.0728 99.2019 58.1441 98.8889L64.0125 73.1391Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M87.0125 73.1391C87.1307 72.6206 87.8693 72.6206 87.9875 73.1391L93.8559 98.8889C93.9272 99.2019 93.6894 99.5 93.3684 99.5H81.6316C81.3106 99.5 81.0728 99.2019 81.1441 98.8889L87.0125 73.1391Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M105.012 72.1391C105.131 71.6206 105.869 71.6206 105.988 72.1391L111.856 97.8889C111.927 98.2019 111.689 98.5 111.368 98.5H99.6316C99.3106 98.5 99.0728 98.2019 99.1441 97.8889L105.012 72.1391Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M123.012 73.1391C123.131 72.6206 123.869 72.6206 123.988 73.1391L129.856 98.8889C129.927 99.2019 129.689 99.5 129.368 99.5H117.632C117.311 99.5 117.073 99.2019 117.144 98.8889L123.012 73.1391Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M147.012 75.1391C147.131 74.6206 147.869 74.6206 147.988 75.1391L153.856 100.889C153.927 101.202 153.689 101.5 153.368 101.5H141.632C141.311 101.5 141.073 101.202 141.144 100.889L147.012 75.1391Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M163.012 73.1391C163.131 72.6206 163.869 72.6206 163.988 73.1391L169.856 98.8889C169.927 99.2019 169.689 99.5 169.368 99.5H157.632C157.311 99.5 157.073 99.2019 157.144 98.8889L163.012 73.1391Z" fill="url(#paint8_linear_1_1015)"/>
              <path d="M179.012 69.1391C179.131 68.6206 179.869 68.6206 179.988 69.1391L185.856 94.8889C185.927 95.2019 185.689 95.5 185.368 95.5H173.632C173.311 95.5 173.073 95.2019 173.144 94.8889L179.012 69.1391Z" fill="url(#paint8_linear_1_1015)"/>
              
              {/* Bintang-bintang Kecil */}
              <circle cx="138" cy="12" r="1" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="95.5" cy="39.5" r="1.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="177.5" cy="23.5" r="1.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="162.5" cy="21.5" r="0.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="56.5" cy="30.5" r="1.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="67" cy="14" r="2" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="38.5" cy="21.5" r="0.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="94.5" cy="7.5" r="0.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="31.5" cy="9.5" r="0.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="50" cy="15" r="1" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="36" cy="34" r="1" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="16" cy="21" r="1" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="101.5" cy="22.5" r="1.5" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="157" cy="10" r="2" fill="#FFFEDA" opacity="0.6"/>
              <circle cx="114" cy="14" r="1" fill="#FFFEDA" opacity="0.6"/>
            </g>
          </motion.g>

          <motion.g
            initial={{ x: isDark ? 116 : 6, y: 5 }}
            animate={{ x: isDark ? 116 : 6, y: 5 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
              mass: 0.8
            }}
          >
            <g filter="url(#filter0_d_1_839)">
              <circle cx="39" cy="40" r="35" fill="url(#paint0_linear_1_839)" />
            </g>
          </motion.g>

        </svg>
      </div>

      {/* Layer Animasi Lonjong yang menyebar ke seluruh layar */}
      <div
        className={`dark-mode-wrapper ${
          isDark ? "dark-theme-active" : "light-theme-active"
        }`}
      >
        <div className="dark-mode-pill" />
      </div>
    </>
  );
}