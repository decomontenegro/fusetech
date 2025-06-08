'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { GlassCard, GlassPanel } from '@/components/ui/GlassCard'
import { StatsCard, StatsGrid } from '@/components/ui/StatsCard'
import { Activity, Zap, Trophy, Target, Info, Bell, Calendar, TrendingUp } from 'lucide-react'

export default function ThemeTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gradient mb-4">Theme Test Page</h1>
        <p className="text-text-secondary">Testing enhanced dark mode with improved contrast ratios</p>
      </div>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Color Palette</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Primary Colors */}
          <div className="space-y-2">
            <h3 className="font-medium text-text-primary">Primary</h3>
            <div className="h-24 bg-primary rounded-lg flex items-center justify-center text-white">Primary</div>
            <div className="h-16 bg-primary-hover rounded-lg flex items-center justify-center text-white">Hover</div>
            <div className="h-16 bg-primary-active rounded-lg flex items-center justify-center text-white">Active</div>
          </div>

          {/* Secondary Colors */}
          <div className="space-y-2">
            <h3 className="font-medium text-text-primary">Secondary</h3>
            <div className="h-24 bg-secondary rounded-lg flex items-center justify-center text-white">Secondary</div>
            <div className="h-16 bg-secondary-hover rounded-lg flex items-center justify-center text-white">Hover</div>
          </div>

          {/* Success Colors */}
          <div className="space-y-2">
            <h3 className="font-medium text-text-primary">Success</h3>
            <div className="h-24 bg-success rounded-lg flex items-center justify-center text-white">Success</div>
            <div className="h-16 bg-success-hover rounded-lg flex items-center justify-center text-white">Hover</div>
          </div>

          {/* Error Colors */}
          <div className="space-y-2">
            <h3 className="font-medium text-text-primary">Error</h3>
            <div className="h-24 bg-error rounded-lg flex items-center justify-center text-white">Error</div>
            <div className="h-16 bg-error-hover rounded-lg flex items-center justify-center text-white">Hover</div>
          </div>
        </div>
      </section>

      {/* Background Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Background Layers</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-bg-primary border border-border-primary rounded-lg">
            <p className="text-text-primary">Primary BG</p>
            <p className="text-text-secondary text-sm">Base layer</p>
          </div>
          <div className="p-4 bg-bg-secondary border border-border-primary rounded-lg">
            <p className="text-text-primary">Secondary BG</p>
            <p className="text-text-secondary text-sm">Layer 2</p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-border-primary rounded-lg">
            <p className="text-text-primary">Tertiary BG</p>
            <p className="text-text-secondary text-sm">Layer 3</p>
          </div>
          <div className="p-4 bg-bg-quaternary border border-border-primary rounded-lg">
            <p className="text-text-primary">Quaternary BG</p>
            <p className="text-text-secondary text-sm">Layer 4</p>
          </div>
        </div>
      </section>

      {/* Glassmorphism Effects */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Glassmorphism Effects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard variant="default" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Default Glass</h3>
            <p className="text-text-secondary text-sm">Standard glass effect with medium blur</p>
          </GlassCard>

          <GlassCard variant="subtle" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Subtle Glass</h3>
            <p className="text-text-secondary text-sm">Lighter glass effect with subtle blur</p>
          </GlassCard>

          <GlassCard variant="strong" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Strong Glass</h3>
            <p className="text-text-secondary text-sm">Stronger glass effect with heavy blur</p>
          </GlassCard>

          <GlassCard variant="gradient" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Gradient Glass</h3>
            <p className="text-text-secondary text-sm">Glass with gradient overlay</p>
          </GlassCard>

          <GlassCard variant="elevated" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Elevated Glass</h3>
            <p className="text-text-secondary text-sm">Glass with shadow elevation</p>
          </GlassCard>

          <GlassCard variant="interactive" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Interactive Glass</h3>
            <p className="text-text-secondary text-sm">Click me for interaction</p>
          </GlassCard>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Button Variants</h2>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="glass">Glass Button</Button>
          <Button variant="glassColored">Glass Colored</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
          <Button variant="warning">Warning Button</Button>
          <Button variant="info">Info Button</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" size="xl">Extra Large</Button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Stats Cards</h2>
        
        <StatsGrid>
          <StatsCard
            title="Primary Stat"
            value="1,234"
            change={15}
            changeLabel="vs last week"
            icon={Activity}
            color="primary"
            subtitle="With subtitle"
          />
          <StatsCard
            title="Success Stat"
            value="98.5%"
            change={5}
            changeLabel="improvement"
            icon={Trophy}
            color="success"
          />
          <StatsCard
            title="Warning Stat"
            value="42"
            change={-8}
            changeLabel="decrease"
            icon={Bell}
            color="warning"
          />
          <StatsCard
            title="Error Stat"
            value="3"
            change={-25}
            changeLabel="errors"
            icon={Target}
            color="error"
          />
        </StatsGrid>
      </section>

      {/* Text Hierarchy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Text Hierarchy</h2>
        
        <GlassPanel padding="md">
          <p className="text-text-primary mb-2">Primary text - Main content and headings</p>
          <p className="text-text-secondary mb-2">Secondary text - Supporting information</p>
          <p className="text-text-tertiary mb-2">Tertiary text - Less important details</p>
          <p className="text-text-quaternary mb-2">Quaternary text - Minimal emphasis</p>
          <p className="mb-2">
            <a href="#" className="text-text-link hover:text-text-link-hover">Link text with hover state</a>
          </p>
        </GlassPanel>
      </section>

      {/* Gradients */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Gradients</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-medium">
            Primary Gradient
          </div>
          <div className="h-32 bg-gradient-secondary rounded-lg flex items-center justify-center text-white font-medium">
            Secondary Gradient
          </div>
          <div className="h-32 bg-gradient-accent rounded-lg flex items-center justify-center text-white font-medium">
            Accent Gradient
          </div>
          <div className="h-32 bg-gradient-success rounded-lg flex items-center justify-center text-white font-medium">
            Success Gradient
          </div>
          <div className="h-32 bg-gradient-warning rounded-lg flex items-center justify-center text-black font-medium">
            Warning Gradient
          </div>
          <div className="h-32 bg-gradient-error rounded-lg flex items-center justify-center text-white font-medium">
            Error Gradient
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Form Elements</h2>
        
        <GlassPanel padding="md">
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-text-primary mb-2">Input Field</label>
              <input
                type="text"
                placeholder="Type something..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Textarea</label>
              <textarea
                placeholder="Write your message..."
                rows={3}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-text-primary mb-2">Select</label>
              <select className="w-full">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </GlassPanel>
      </section>

      {/* Shadows */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Shadow System</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-bg-card rounded-lg shadow-xs">
            <p className="text-text-primary">XS Shadow</p>
          </div>
          <div className="p-4 bg-bg-card rounded-lg shadow-sm">
            <p className="text-text-primary">SM Shadow</p>
          </div>
          <div className="p-4 bg-bg-card rounded-lg shadow-md">
            <p className="text-text-primary">MD Shadow</p>
          </div>
          <div className="p-4 bg-bg-card rounded-lg shadow-lg">
            <p className="text-text-primary">LG Shadow</p>
          </div>
          <div className="p-4 bg-bg-card rounded-lg shadow-xl">
            <p className="text-text-primary">XL Shadow</p>
          </div>
          <div className="p-4 bg-bg-card rounded-lg shadow-2xl">
            <p className="text-text-primary">2XL Shadow</p>
          </div>
          <div className="p-4 bg-bg-card rounded-lg shadow-glass">
            <p className="text-text-primary">Glass Shadow</p>
          </div>
          <div className="p-4 bg-bg-card rounded-lg shadow-inner">
            <p className="text-text-primary">Inner Shadow</p>
          </div>
        </div>
      </section>
    </div>
  )
}