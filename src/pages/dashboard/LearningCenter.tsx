import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  GraduationCap, 
  Award, 
  Target, 
  Book, 
  Brain, 
  CheckCircle, 
  Lock,
  Play,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // in minutes
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[];
  skills: string[];
  completion_rate: number;
  is_completed: boolean;
  is_locked: boolean;
  icon: string;
}

interface UserProgress {
  total_modules: number;
  completed_modules: number;
  current_level: string;
  skill_points: number;
  accuracy_improvement: number;
  learning_streak: number;
  achievements: string[];
}

const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'truth-verification-basics',
    title: 'Truth Verification Fundamentals',
    description: 'Learn the core principles of fact-checking and source verification',
    category: 'basics',
    duration: 30,
    difficulty: 1,
    prerequisites: [],
    skills: ['Source Evaluation', 'Basic Fact-Checking', 'Bias Recognition'],
    completion_rate: 0,
    is_completed: false,
    is_locked: false,
    icon: 'shield'
  },
  {
    id: 'blockchain-staking',
    title: 'Blockchain Staking Strategies',
    description: 'Master the art of strategic staking on truth claims',
    category: 'basics',
    duration: 45,
    difficulty: 2,
    prerequisites: ['truth-verification-basics'],
    skills: ['Risk Assessment', 'Stake Calculation', 'Market Analysis'],
    completion_rate: 0,
    is_completed: false,
    is_locked: true,
    icon: 'target'
  },
  {
    id: 'ai-assisted-verification',
    title: 'AI-Assisted Truth Detection',
    description: 'Learn to work effectively with AI moderators for enhanced accuracy',
    category: 'intermediate',
    duration: 60,
    difficulty: 3,
    prerequisites: ['truth-verification-basics', 'blockchain-staking'],
    skills: ['AI Collaboration', 'Pattern Recognition', 'Advanced Analysis'],
    completion_rate: 0,
    is_completed: false,
    is_locked: true,
    icon: 'brain'
  },
  {
    id: 'debate-moderation',
    title: 'Community Debate Moderation',
    description: 'Advanced techniques for moderating truth debates and challenges',
    category: 'advanced',
    duration: 90,
    difficulty: 4,
    prerequisites: ['ai-assisted-verification'],
    skills: ['Conflict Resolution', 'Evidence Evaluation', 'Community Leadership'],
    completion_rate: 0,
    is_completed: false,
    is_locked: true,
    icon: 'users'
  },
  {
    id: 'expert-certification',
    title: 'Expert Truth Guardian Certification',
    description: 'Become a certified Truth Guardian with platform governance rights',
    category: 'expert',
    duration: 120,
    difficulty: 5,
    prerequisites: ['debate-moderation'],
    skills: ['Platform Governance', 'Expert Analysis', 'Truth Guardian Status'],
    completion_rate: 0,
    is_completed: false,
    is_locked: true,
    icon: 'award'
  }
];

const ACHIEVEMENTS = [
  { id: 'first-lesson', name: 'First Steps', description: 'Complete your first learning module', icon: '🎯' },
  { id: 'truth-seeker', name: 'Truth Seeker', description: 'Complete 3 learning modules', icon: '🔍' },
  { id: 'fact-checker', name: 'Fact Checker', description: 'Complete 5 learning modules', icon: '✅' },
  { id: 'truth-expert', name: 'Truth Expert', description: 'Complete all learning modules', icon: '🏆' },
  { id: 'streak-master', name: 'Streak Master', description: 'Maintain a 7-day learning streak', icon: '🔥' },
  { id: 'accuracy-expert', name: 'Accuracy Expert', description: 'Achieve 95% accuracy rating', icon: '⭐' }
];

export function LearningCenter() {
  const { user } = useAuth();
  const [modules, setModules] = useState<LearningModule[]>(LEARNING_MODULES);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    total_modules: LEARNING_MODULES.length,
    completed_modules: 0,
    current_level: 'Newcomer',
    skill_points: 0,
    accuracy_improvement: 0,
    learning_streak: 0,
    achievements: []
  });
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, [user?.id]);

  const loadUserProgress = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Load user learning progress
      const { data: progress } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user.id);

      // Load user profile for skill points and level
      const { data: profile } = await supabase
        .from('profiles')
        .select('reputation_score, accuracy_rate')
        .eq('id', user.id)
        .single();

      if (progress && profile) {
        const completedModuleIds = progress.map(p => p.module_id);
        const updatedModules = modules.map(module => ({
          ...module,
          is_completed: completedModuleIds.includes(module.id),
          is_locked: !module.prerequisites.every(prereq => 
            completedModuleIds.includes(prereq)
          ) && module.prerequisites.length > 0,
          completion_rate: progress.find(p => p.module_id === module.id)?.completion_rate || 0
        }));

        setModules(updatedModules);

        const userLevel = profile.reputation_score > 900 ? 'Truth Guardian' :
                         profile.reputation_score > 600 ? 'Expert' :
                         profile.reputation_score > 300 ? 'Fact Checker' :
                         profile.reputation_score > 100 ? 'Truth Seeker' : 'Newcomer';

        setUserProgress({
          total_modules: LEARNING_MODULES.length,
          completed_modules: completedModuleIds.length,
          current_level: userLevel,
          skill_points: Math.floor(profile.reputation_score / 10),
          accuracy_improvement: profile.accuracy_rate || 0,
          learning_streak: Math.floor(Math.random() * 14), // Simulated for now
          achievements: [] // Will be populated from achievements table
        });
      }
    } catch (error) {
      console.error('Failed to load learning progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startModule = async (module: LearningModule) => {
    if (module.is_locked) return;

    setSelectedModule(module);

    // Track module start
    try {
      await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: user?.id,
          module_id: module.id,
          started_at: new Date().toISOString(),
          completion_rate: 0
        });
    } catch (error) {
      console.error('Failed to track module start:', error);
    }
  };

  const completeModule = async (moduleId: string) => {
    try {
      await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: user?.id,
          module_id: moduleId,
          completed_at: new Date().toISOString(),
          completion_rate: 100
        });

      // Update local state
      setModules(prev => prev.map(module => {
        if (module.id === moduleId) {
          return { ...module, is_completed: true, completion_rate: 100 };
        }
        // Unlock next modules
        if (module.prerequisites.includes(moduleId)) {
          return { ...module, is_locked: false };
        }
        return module;
      }));

      setUserProgress(prev => ({
        ...prev,
        completed_modules: prev.completed_modules + 1,
        skill_points: prev.skill_points + 100
      }));

      setSelectedModule(null);
    } catch (error) {
      console.error('Failed to complete module:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'intermediate': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'advanced': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'expert': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < difficulty ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  const getModuleIcon = (iconName: string) => {
    const icons = {
      shield: Shield,
      target: Target,
      brain: Brain,
      users: Users,
      award: Award
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Book;
    return <IconComponent className="w-6 h-6" />;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Learning Center</h2>
                <p className="text-gray-400">Master truth verification and earn your way to Truth Guardian status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userProgress.current_level}</div>
              <div className="text-sm text-gray-400">Current Level</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {userProgress.completed_modules}/{userProgress.total_modules}
              </div>
              <div className="text-sm text-gray-400">Modules Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userProgress.skill_points}</div>
              <div className="text-sm text-gray-400">Skill Points</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userProgress.accuracy_improvement}%</div>
              <div className="text-sm text-gray-400">Accuracy Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Overall Completion</span>
                <span className="text-white">
                  {Math.round((userProgress.completed_modules / userProgress.total_modules) * 100)}%
                </span>
              </div>
              <Progress 
                value={(userProgress.completed_modules / userProgress.total_modules) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Newcomer</span>
                <span>Truth Seeker</span>
                <span>Fact Checker</span>
                <span>Expert</span>
                <span>Truth Guardian</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle>Learning Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg border transition-all ${
                    module.is_locked
                      ? 'border-gray-700 bg-gray-800/30 opacity-50'
                      : module.is_completed
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-purple-500/30 hover:bg-purple-500/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      module.is_completed 
                        ? 'bg-green-500/20' 
                        : module.is_locked 
                        ? 'bg-gray-700/50' 
                        : 'bg-purple-500/20'
                    }`}>
                      {module.is_locked ? (
                        <Lock className="w-6 h-6 text-gray-500" />
                      ) : module.is_completed ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        getModuleIcon(module.icon)
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{module.title}</h3>
                        <Badge className={getCategoryColor(module.category)}>
                          {module.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-400 mb-3">{module.description}</p>

                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                        <span>{module.duration} min</span>
                        <div className="flex items-center gap-1">
                          {getDifficultyStars(module.difficulty)}
                        </div>
                        <span>{module.skills.length} skills</span>
                      </div>

                      {module.completion_rate > 0 && module.completion_rate < 100 && (
                        <div className="mb-3">
                          <Progress value={module.completion_rate} className="h-1" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {module.skills.slice(0, 2).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {module.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{module.skills.length - 2}
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => module.is_completed 
                            ? null 
                            : module.completion_rate > 0 
                            ? completeModule(module.id)
                            : startModule(module)
                          }
                          disabled={module.is_locked}
                          size="sm"
                          className={
                            module.is_completed
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                          }
                        >
                          {module.is_completed ? (
                            <><CheckCircle className="w-4 h-4 mr-1" /> Completed</>
                          ) : module.completion_rate > 0 ? (
                            <><Play className="w-4 h-4 mr-1" /> Continue</>
                          ) : (
                            <><Play className="w-4 h-4 mr-1" /> Start</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = userProgress.achievements.includes(achievement.id);
                
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      isUnlocked
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-gray-700 bg-gray-800/30 opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 