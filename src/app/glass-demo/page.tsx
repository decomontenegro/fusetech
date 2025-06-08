'use client';

import { useState } from 'react';
import {
  GlassCard,
  GlassPanel,
  GlassButton,
  GlassModal,
  GlassAlert,
  GlassInput,
  GlassTextarea,
  GlassSelect,
  GlassDropdown,
  GlassTooltip,
  GlassPopover,
  GlassNav,
  GlassBottomNav,
  GlassNotificationContainer,
  useGlassNotifications,
  Button,
  StatsCard,
  StatsGrid,
} from '@/components/ui';
import { 
  Home, 
  Activity, 
  Trophy, 
  Gift, 
  Wallet,
  Search,
  Mail,
  Lock,
  User,
  Settings,
  Bell,
  Heart,
  Star,
  Zap
} from 'lucide-react';

export default function GlassDemoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('');
  const { notifications, notify, removeNotification } = useGlassNotifications();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', active: true },
    { icon: <Activity className="w-5 h-5" />, label: 'Activities' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Challenges' },
    { icon: <Gift className="w-5 h-5" />, label: 'Rewards' },
    { icon: <Wallet className="w-5 h-5" />, label: 'Wallet' },
  ];

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
    { value: 'option4', label: 'Option 4' },
  ];

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-8">
      {/* Background gradient mesh */}
      <div className="fixed inset-0 mesh-gradient opacity-30 pointer-events-none" />
      
      {/* Notifications */}
      <GlassNotificationContainer
        notifications={notifications}
        position="top-right"
        onClose={removeNotification}
      />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient">
            Glassmorphism Components
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Modern glass effect components with theme support and animations
          </p>
        </div>

        {/* Glass Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Glass Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard variant="default" animation="fadeIn">
              <h3 className="font-semibold text-primary mb-2">Default Glass</h3>
              <p className="text-secondary text-sm">
                Basic glass effect with subtle backdrop blur
              </p>
            </GlassCard>

            <GlassCard variant="elevated" animation="scaleIn" animationDelay={0.1}>
              <h3 className="font-semibold text-primary mb-2">Elevated Glass</h3>
              <p className="text-secondary text-sm">
                Enhanced shadow and hover effects
              </p>
            </GlassCard>

            <GlassCard 
              variant="interactive" 
              animation="slideIn" 
              animationDelay={0.2}
              onClick={() => notify.info('Interactive card clicked!')}
            >
              <h3 className="font-semibold text-primary mb-2">Interactive Glass</h3>
              <p className="text-secondary text-sm">
                Click me for interaction
              </p>
            </GlassCard>

            <GlassCard 
              variant="gradient" 
              animation="fadeIn" 
              animationDelay={0.3}
              enableGlow
              glowColor="var(--color-accent)"
            >
              <h3 className="font-semibold text-primary mb-2">Gradient Glass</h3>
              <p className="text-secondary text-sm">
                With glow effect on hover
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Glass Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Glass Buttons</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="glass" icon={<Zap className="w-4 h-4" />}>
              Glass Button
            </Button>
            <Button variant="glassColored" icon={<Heart className="w-4 h-4" />}>
              Colored Glass
            </Button>
            <GlassButton className="px-6 py-2">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Custom Glass Button
              </span>
            </GlassButton>
          </div>
        </section>

        {/* Glass Inputs Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Glass Inputs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <GlassInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
              />
              
              <GlassInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                variant="filled"
              />
              
              <GlassInput
                label="Search"
                type="text"
                placeholder="Search..."
                icon={<Search className="w-4 h-4" />}
                variant="minimal"
              />
              
              <GlassInput
                label="With Error"
                type="text"
                placeholder="This has an error"
                icon={<User className="w-4 h-4" />}
                error="This field is required"
              />
            </div>
            
            <div className="space-y-4">
              <GlassTextarea
                label="Message"
                placeholder="Enter your message..."
                rows={4}
              />
              
              <GlassSelect
                label="Select Option"
                options={selectOptions}
                placeholder="Choose an option"
              />
              
              <GlassDropdown
                label="Custom Dropdown"
                options={selectOptions}
                value={dropdownValue}
                onChange={setDropdownValue}
                placeholder="Select from dropdown"
              />
            </div>
          </div>
        </section>

        {/* Glass Navigation Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Glass Navigation</h2>
          
          <div className="space-y-6">
            <GlassNav variant="default" position="static">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-primary">Static Nav</span>
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm">Home</Button>
                  <Button variant="ghost" size="sm">About</Button>
                  <Button variant="ghost" size="sm">Contact</Button>
                </div>
              </div>
            </GlassNav>
            
            <div className="h-32 relative bg-tertiary rounded-lg overflow-hidden">
              <GlassBottomNav items={navItems} />
            </div>
          </div>
        </section>

        {/* Glass Modal & Tooltips Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Modals & Tooltips</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            
            <Button onClick={() => setAlertOpen(true)}>
              Open Alert
            </Button>
            
            <GlassTooltip content="This is a glass tooltip!">
              <Button variant="glass">Hover for Tooltip</Button>
            </GlassTooltip>
            
            <GlassPopover 
              content={
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Popover Content</h4>
                  <p className="text-sm text-secondary">
                    This is a glass popover with more content
                  </p>
                  <Button size="sm" variant="glass">Action</Button>
                </div>
              }
            >
              <Button variant="glass">Click for Popover</Button>
            </GlassPopover>
          </div>
        </section>

        {/* Glass Notifications Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Notifications</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="glass"
              onClick={() => notify.success('Success!', 'Operation completed successfully')}
            >
              Success Notification
            </Button>
            
            <Button 
              variant="glass"
              onClick={() => notify.error('Error!', 'Something went wrong')}
            >
              Error Notification
            </Button>
            
            <Button 
              variant="glass"
              onClick={() => notify.warning('Warning!', 'Please check your input')}
            >
              Warning Notification
            </Button>
            
            <Button 
              variant="glass"
              onClick={() => notify.info('Info', 'This is an informational message')}
            >
              Info Notification
            </Button>
          </div>
        </section>

        {/* Stats Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Stats Cards</h2>
          
          <StatsGrid>
            <StatsCard
              title="Total Revenue"
              value="$12,345"
              change={23}
              changeLabel="vs last month"
              icon={Wallet}
              color="primary"
            />
            <StatsCard
              title="Active Users"
              value="1,234"
              change={-5}
              changeLabel="vs last week"
              icon={User}
              color="success"
            />
            <StatsCard
              title="Engagement"
              value="89%"
              change={12}
              icon={Heart}
              color="warning"
            />
            <StatsCard
              title="Performance"
              value="98.5%"
              icon={Zap}
              color="secondary"
            />
          </StatsGrid>
        </section>

        {/* Glass Effects Showcase */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Glass Effects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassPanel className="h-48 flex items-center justify-center glass-shimmer">
              <p className="text-primary font-medium">Shimmer Effect</p>
            </GlassPanel>
            
            <GlassPanel className="h-48 flex items-center justify-center glass-morph">
              <p className="text-primary font-medium">Morphing Effect</p>
            </GlassPanel>
            
            <GlassPanel className="h-48 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 glass-gradient-radial" />
              <p className="text-primary font-medium relative z-10">Gradient Overlay</p>
            </GlassPanel>
          </div>
        </section>
      </div>

      {/* Modals */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Glass Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            This is a beautiful glass modal with backdrop blur and smooth animations.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glass" onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </GlassModal>

      <GlassAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Glass Alert"
        message="This is a glass alert dialog"
        type="info"
      />
    </div>
  );
}