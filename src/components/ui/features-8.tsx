import { Card, CardContent } from './card'
import { Shield, Users, Zap, Brain, Coins, Mic } from 'lucide-react'

export function Features() {
    return (
        <section className="bg-black py-16 md:py-32 relative overflow-hidden" id="features">
            {/* 3D Background Elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-bounce"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-spin-slow"></div>
            </div>
            
            <div className="mx-auto max-w-6xl lg:max-w-7xl px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-black text-white text-5xl md:text-6xl mb-8 leading-tight">
                        🚀 Revolutionary{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                            Features
                        </span>
                    </h2>
                    <p className="text-gray-300 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed">
                        Built with cutting-edge technology to ensure transparency, security, and rewards for truth in the digital age 🌟
                    </p>
                </div>
                
                <div className="relative">
                    <div className="relative z-10 grid grid-cols-6 gap-6">
                        {/* AI Truth Verification - Large Card */}
                        <Card className="relative col-span-full flex overflow-hidden lg:col-span-2 group bg-gray-900/80 border-purple-500/30 hover:border-purple-400/60 transition-all duration-500">
                            <CardContent className="relative m-auto size-fit pt-6">
                                <div className="relative flex h-24 w-56 items-center">
                                    <svg className="text-purple-400 absolute inset-0 size-full" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span className="mx-auto block w-fit text-5xl font-semibold text-white">95%</span>
                                </div>
                                <h2 className="mt-6 text-center text-3xl font-semibold text-white">AI Truth Score</h2>
                                <p className="text-center text-gray-300 mt-2">Real-time fact verification with Tavus AI moderators</p>
                            </CardContent>
                        </Card>

                        {/* Blockchain Security */}
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 group bg-gray-900/80 border-green-500/30 hover:border-green-400/60 transition-all duration-500">
                            <CardContent className="pt-6">
                                <div className="relative mx-auto flex aspect-square size-32 rounded-full border border-green-500/30 before:absolute before:-inset-2 before:rounded-full before:border before:border-green-500/20">
                                    <Shield className="m-auto h-16 w-16 text-green-400" />
                                </div>
                                <div className="relative z-10 mt-6 space-y-2 text-center">
                                    <h2 className="text-lg font-medium text-white transition">Blockchain Security</h2>
                                    <p className="text-gray-300">Algorand-powered immutable records and secure ALGO transactions with smart contract automation.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Truth Staking Performance */}
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 group bg-gray-900/80 border-yellow-500/30 hover:border-yellow-400/60 transition-all duration-500">
                            <CardContent className="pt-6">
                                <div className="pt-6 lg:px-6">
                                    <div className="w-full bg-gray-800 rounded-lg p-4 mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-yellow-400 font-medium">Total Earned</span>
                                            <span className="text-white font-bold">$1,234.56</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{width: '78%'}}></div>
                                        </div>
                                        <div className="text-sm text-gray-400">89% accuracy rate</div>
                                    </div>
                                </div>
                                <div className="relative z-10 mt-2 space-y-2 text-center">
                                    <h2 className="text-lg font-medium text-white transition">Truth Staking</h2>
                                    <p className="text-gray-300">Stake ALGO on verified information and earn rewards for accurate fact-checking.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Voice AI Integration */}
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3 group bg-gray-900/80 border-blue-500/30 hover:border-blue-400/60 transition-all duration-500">
                            <CardContent className="grid pt-6 sm:grid-cols-2">
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    <div className="relative flex aspect-square size-12 rounded-full border border-blue-500/30 before:absolute before:-inset-2 before:rounded-full before:border before:border-blue-500/20">
                                        <Mic className="m-auto size-5 text-blue-400" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-medium text-white transition">Voice AI Rooms</h2>
                                        <p className="text-gray-300">ElevenLabs-powered voice discussions with AI moderators and real-time transcription.</p>
                                    </div>
                                </div>
                                <div className="rounded-tl-lg relative -mb-6 -mr-6 mt-6 h-fit border-l border-t border-blue-500/20 p-6 py-6 sm:ml-6">
                                    <div className="absolute left-3 top-2 flex gap-1">
                                        <span className="block size-2 rounded-full bg-blue-400 animate-pulse"></span>
                                        <span className="block size-2 rounded-full bg-purple-400 animate-pulse delay-100"></span>
                                        <span className="block size-2 rounded-full bg-cyan-400 animate-pulse delay-200"></span>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                                            <span className="text-sm text-gray-300">AI Moderator Active</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                            <span className="text-sm text-gray-300">3 Users Speaking</span>
                                        </div>
                                        <div className="text-xs text-gray-400">Real-time fact checking active</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Community Reputation */}
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3 group bg-gray-900/80 border-pink-500/30 hover:border-pink-400/60 transition-all duration-500">
                            <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    <div className="relative flex aspect-square size-12 rounded-full border border-pink-500/30 before:absolute before:-inset-2 before:rounded-full before:border before:border-pink-500/20">
                                        <Users className="m-auto size-6 text-pink-400" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-medium text-white transition">Community Reputation</h2>
                                        <p className="text-gray-300">Build credibility through verified contributions and earn trust scores that unlock platform privileges.</p>
                                    </div>
                                </div>
                                <div className="relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px before:bg-pink-500/30 sm:-my-6 sm:-mr-6">
                                    <div className="relative flex h-full flex-col justify-center space-y-6 py-6">
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border border-pink-500/30 bg-pink-500/10 px-2 py-1 text-xs text-pink-300">Truth Expert</span>
                                            <div className="ring-pink-500/30 size-7 ring-2">
                                                <div className="size-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                                            </div>
                                        </div>
                                        <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                                            <div className="ring-blue-500/30 size-8 ring-2">
                                                <div className="size-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                            </div>
                                            <span className="block h-fit rounded border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-300">Fact Checker</span>
                                        </div>
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-300">Verified</span>
                                            <div className="ring-green-500/30 size-7 ring-2">
                                                <div className="size-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                
                {/* Comparison Table */}
                <div className="mt-20">
                    <div className="text-center mb-12">
                        <h3 className="font-black text-white text-4xl md:text-5xl mb-4">
                            The Future vs. The Past
                        </h3>
                        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                            See how TruthChain revolutionizes social media with truth staking and blockchain transparency
                        </p>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/60 backdrop-blur-xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-700/50">
                            {/* Header Column */}
                            <div className="p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                                        <h4 className="text-xl font-bold text-white">Platform Features</h4>
                                    </div>
                                    
                                    <div className="space-y-4 text-left">
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex items-center">
                                            <span className="text-gray-300 font-medium">Content Verification</span>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex items-center">
                                            <span className="text-gray-300 font-medium">Misinformation Control</span>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex items-center">
                                            <span className="text-gray-300 font-medium">User Incentives</span>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex items-center">
                                            <span className="text-gray-300 font-medium">Transparency</span>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex items-center">
                                            <span className="text-gray-300 font-medium">Economic Model</span>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex items-center">
                                            <span className="text-gray-300 font-medium">Community Governance</span>
                                        </div>
                                        <div className="py-4 min-h-[60px] flex items-center">
                                            <span className="text-gray-300 font-medium">Data Ownership</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Traditional Social Media */}
                            <div className="p-8 bg-gradient-to-br from-red-900/20 to-orange-900/20">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-3">
                                            <span className="text-red-400 text-2xl">❌</span>
                                            <span className="text-red-300 font-semibold">Traditional Social Media</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 text-center">
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex flex-col justify-center">
                                            <span className="text-red-300">Manual moderation only</span>
                                            <div className="text-xs text-gray-400 mt-1">Slow & inconsistent</div>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex flex-col justify-center">
                                            <span className="text-red-300">After-the-fact removal</span>
                                            <div className="text-xs text-gray-400 mt-1">Damage already done</div>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex flex-col justify-center">
                                            <span className="text-red-300">Ad revenue focused</span>
                                            <div className="text-xs text-gray-400 mt-1">Users are the product</div>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex flex-col justify-center">
                                            <span className="text-red-300">Algorithmic black box</span>
                                            <div className="text-xs text-gray-400 mt-1">No accountability</div>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex flex-col justify-center">
                                            <span className="text-red-300">Free (with hidden costs)</span>
                                            <div className="text-xs text-gray-400 mt-1">Privacy & attention</div>
                                        </div>
                                        <div className="py-4 border-b border-gray-700/30 min-h-[60px] flex flex-col justify-center">
                                            <span className="text-red-300">Corporate control</span>
                                            <div className="text-xs text-gray-400 mt-1">Top-down decisions</div>
                                        </div>
                                        <div className="py-4 min-h-[60px] flex flex-col justify-center">
                                            <span className="text-red-300">Platform owns data</span>
                                            <div className="text-xs text-gray-400 mt-1">No user control</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* TruthChain */}
                            <div className="p-8 bg-gradient-to-br from-green-900/20 to-blue-900/20">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-3">
                                        
                                            <span className="text-green-400 text-2xl">✅</span>
                                            <span className="text-green-300 font-semibold">TruthChain Platform</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 text-center">
                                        <div className="py-3 border-b border-gray-700/30">
                                            <span className="text-green-300">AI + Community verification</span>
                                            <div className="text-xs text-gray-400 mt-1">95% accuracy real-time</div>
                                        </div>
                                        <div className="py-3 border-b border-gray-700/30">
                                            <span className="text-green-300">Preventive truth staking</span>
                                            <div className="text-xs text-gray-400 mt-1">Stop before it spreads</div>
                                        </div>
                                        <div className="py-3 border-b border-gray-700/30">
                                            <span className="text-green-300">Earn for accuracy</span>
                                            <div className="text-xs text-gray-400 mt-1">ALGO rewards for truth</div>
                                        </div>
                                        <div className="py-3 border-b border-gray-700/30">
                                            <span className="text-green-300">Blockchain transparency</span>
                                            <div className="text-xs text-gray-400 mt-1">All actions verifiable</div>
                                        </div>
                                        <div className="py-3 border-b border-gray-700/30">
                                            <span className="text-green-300">Stake-to-earn model</span>
                                            <div className="text-xs text-gray-400 mt-1">Truth has value</div>
                                        </div>
                                        <div className="py-3 border-b border-gray-700/30">
                                            <span className="text-green-300">Community driven</span>
                                            <div className="text-xs text-gray-400 mt-1">Users decide together</div>
                                        </div>
                                        <div className="py-3">
                                            <span className="text-green-300">User owns data</span>
                                            <div className="text-xs text-gray-400 mt-1">Decentralized control</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
} 