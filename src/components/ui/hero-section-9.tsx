import * as React from "react"
import { cn } from '../../lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './button'
import { useAuth } from '../../lib/auth'

export const HeroSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleJoinClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Check if user is already logged in
        if (user) {
            console.log('🔄 User already authenticated, redirecting to dashboard...');
            navigate('/dashboard');
            return;
        }
        // If not logged in, navigate to auth page
        navigate('/auth');
    };

    return (
        <div>
            <main>
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-87.5 absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section className="overflow-hidden bg-white dark:bg-transparent">
                    <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-24">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">Where Truth Has Value</h1>
                            <p className="mx-auto my-8 max-w-2xl text-xl">A blockchain social media platform that rewards verified information and builds communities around shared truth. Stake on claims, earn ALGO rewards, and help create a more trustworthy internet.</p>

                            <Button
                                size="lg"
                                onClick={handleJoinClick}>
                                <span className="btn-label">Join TruthChain</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mx-auto -mt-16 max-w-7xl [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
                        <div className="[perspective:1200px] [mask-image:linear-gradient(to_right,black_50%,transparent_100%)] -mr-16 pl-16 lg:-mr-56 lg:pl-56">
                            <div className="[transform:rotateX(20deg);]">
                                <div className="lg:h-[44rem] relative skew-x-[.36rad]">
                                    <img
                                        className="rounded-[--radius] z-[2] relative border dark:hidden"
                                        src="/Dashboardhome.png"
                                        alt="TruthChain dashboard interface"
                                        width={2880}
                                        height={2074}
                                    />
                                    <img
                                        className="rounded-[--radius] z-[2] relative hidden border dark:block"
                                        src="/Dashboardhome.png"
                                        alt="TruthChain dashboard interface dark mode"
                                        width={2880}
                                        height={2074}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8">
                <rect width="40" height="40" rx="8" fill="url(#logo-gradient)" />
                <path
                    d="M20 8L28 16L20 24L12 16L20 8Z"
                    fill="white"
                    fillOpacity="0.9"
                />
                <circle cx="20" cy="16" r="3" fill="white" />
                <defs>
                    <linearGradient
                        id="logo-gradient"
                        x1="0"
                        y1="0"
                        x2="40"
                        y2="40"
                        gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8B5CF6" />
                        <stop offset="0.5" stopColor="#EC4899" />
                        <stop offset="1" stopColor="#EF4444" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="text-xl font-bold">TruthChain</span>
        </div>
    )
} 