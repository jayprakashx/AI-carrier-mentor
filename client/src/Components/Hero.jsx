import React from 'react';
import { Zap, ArrowRight, Cpu, Briefcase } from 'lucide-react';

// Pseudo-3D Visualization Component (The Interactive, Tilting Roadmap)
const Roadmap3DAnimation = ({ rotationX, rotationY }) => {
    // The base style object for the main 3D container
    const dynamicStyle = {
        // Apply rotation based on mouse position
        transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
        // Add a subtle transition for smooth movement
        transition: 'transform 0.1s ease-out',
        // Required CSS property to make the 3D transforms work on children
        transformStyle: 'preserve-3d',
    };

    // The pulse animation is simple enough to keep in a style block for paths
    const PathPulseStyle = () => (
        <style>
            {`
                @keyframes path-pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1.0; }
                }
                .animate-path-pulse {
                    animation: path-pulse 2s ease-in-out infinite;
                }
            `}
        </style>
    );

    return (
        <div className="relative w-full h-96 flex justify-center items-center">
            <PathPulseStyle />
            
            {/* The main 3D-effect container with dynamic rotation */}
            {/* Initial angle is set to look good when centered, and then mouse takes over */}
            <div 
                className="relative w-80 h-80"
                style={dynamicStyle}
            >
                
                {/* 1. Base Platform (Looks like it's floating on an angle) */}
                {/* translate-z-[-20px] pushes this element into the background layer */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-3xl shadow-2xl shadow-violet-500/50 border border-violet-200 transform translate-z-[-20px] rotate-x-[5deg]"></div>

                {/* 2. AI Start Node (CPU) - Now Interactive */}
                {/* translate-z-10 brings this element forward */}
                <button 
                    className="absolute top-10 left-10 transform translate-z-10 transition duration-300 cursor-pointer hover:scale-[1.15] hover:shadow-2xl hover:shadow-violet-500/80 focus:outline-none focus:ring-4 focus:ring-violet-300/50 rounded-full"
                    aria-label="AI Guidance Start Point"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 shadow-xl flex items-center justify-center ring-4 ring-violet-300">
                        <Cpu size={36} className="text-white transform rotate-z-30"/>
                    </div>
                    <div className="text-violet-700 text-xs font-bold mt-1 text-center">AI Guidance</div>
                </button>

                {/* 3. Path Segments (Curving Roadmap) - Pulse animation applied to each segment */}
                {/* Segment 1: Start to Middle */}
                <div className="absolute top-20 left-20 w-32 h-2 bg-violet-400 rounded-full transform rotate-[20deg] translate-z-[10px] animate-path-pulse"></div>
                
                {/* Segment 2: Middle Arc (using a rotated rectangle for depth illusion) */}
                <div className="absolute top-24 left-44 w-2 h-24 bg-violet-400 rounded-full transform rotate-x-[10deg] translate-z-[15px] animate-path-pulse"></div>

                {/* Segment 3: Final Straight */}
                <div className="absolute top-44 left-44 w-32 h-2 bg-violet-400 rounded-full transform rotate-z-[-20deg] translate-z-[20px] animate-path-pulse"></div>
                
                {/* 4. Goal Node (Briefcase) - Now Interactive */}
                {/* translate-z-30 brings this element furthest forward */}
                <button 
                    className="absolute bottom-10 right-10 transform translate-z-30 transition duration-300 cursor-pointer hover:scale-[1.15] hover:shadow-2xl hover:shadow-teal-500/80 focus:outline-none focus:ring-4 focus:ring-teal-300/50 rounded-xl"
                    aria-label="Dream Career Goal"
                >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-2xl shadow-teal-500/50 flex items-center justify-center ring-4 ring-teal-300">
                        <Briefcase size={36} className="text-white"/>
                    </div>
                    <div className="text-teal-700 text-xs font-bold mt-1 text-center">Dream Career</div>
                </button>

            </div>
            
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const [containerSize, setContainerSize] = React.useState({ width: 400, height: 400 });
    const heroRef = React.useRef(null);
    const rotationMax = 8; // Maximum angle of tilt

    React.useEffect(() => {
        const handleMouseMove = (event) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                setContainerSize({ width: rect.width, height: rect.height });
                setMousePos({ x, y });
            }
        };

        const targetElement = heroRef.current;
        if (targetElement) {
            targetElement.addEventListener('mousemove', handleMouseMove);
            // Initialize size on mount
            setContainerSize({ width: targetElement.clientWidth, height: targetElement.clientHeight });
        }

        return () => {
            if (targetElement) {
                targetElement.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    // Calculate rotation based on mouse position relative to the container center
    // Mouse X controls Y-axis rotation (tilt left/right)
    // Mouse Y controls X-axis rotation (tilt up/down)
    const normalizedX = (mousePos.x / containerSize.width) - 0.5;
    const normalizedY = (mousePos.y / containerSize.height) - 0.5;

    // Invert X rotation for a natural tilt direction and cap at max angle
    const rotationY = Math.min(Math.max(normalizedX * rotationMax * 2, -rotationMax), rotationMax) * -1;
    const rotationX = Math.min(Math.max(normalizedY * rotationMax * 2, -rotationMax), rotationMax);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            
            {/* --- HERO SECTION --- */}
            <main id="home" className="pt-20 pb-24 md:pt-32 md:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
                        
                        {/* Content Column (Text and CTAs) */}
                        <div className="lg:col-span-6 xl:col-span-7">
                            
                            {/* Tagline */}
                            <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 shadow-sm mb-4">
                                <Zap size={16} className="mr-1.5" />
                                Future-Proof Your Career
                            </span>

                            {/* Main Title */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tighter leading-tight mb-6">
                                The <span className="text-violet-600">AI-Powered</span> Path to Your
                                <span className="block text-gray-700">Dream Tech Career</span>
                            </h1>

                            {/* Subtext / Value Proposition */}
                            <p className="mt-3 text-xl text-gray-600 max-w-lg mb-8">
                                Personalized skill paths, real-time internship matches, and automated career guidance tailored specifically for BPUT students.
                            </p>

                            {/* Call to Action Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <a
                                    href="/ats-checker"
                                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-violet-600 hover:bg-violet-700 transition duration-300 transform hover:scale-[1.02] active:scale-95"
                                >
                                    Get AI ATS Checker
                                    <ArrowRight size={20} className="ml-2" />
                                </a>
                                <a
                                    href="#skill-path"
                                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-violet-200 text-base font-semibold rounded-xl text-violet-700 bg-white hover:bg-violet-50 transition duration-300 transform hover:shadow-md active:scale-95"
                                >
                                    Explore Skill Paths
                                </a>
                            </div>

                        </div>
                        
                        {/* Visual Column (The new 3D Illustration) - Mouse event listener is attached here */}
                        <div 
                            ref={heroRef}
                            className="hidden lg:col-span-6 xl:col-span-5 lg:flex justify-center items-center mt-12 lg:mt-0"
                        >
                            <div className="w-full max-w-md h-96 p-6">
                                <Roadmap3DAnimation rotationX={rotationX} rotationY={rotationY} />
                            </div>
                        </div>
                        
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;