import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@fuseapp/ui';
import { PieChart, Activity } from 'lucide-react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar componentes necessários do Chart.js
Chart.register(...registerables);

interface DataItem {
  label: string;
  value: number;
  color?: string;
}

interface ActivityDistributionChartProps {
  title: string;
  data: DataItem[];
  height?: number;
  showLegend?: boolean;
  doughnut?: boolean;
}

export const ActivityDistributionChart: React.FC<ActivityDistributionChartProps> = ({
  title,
  data,
  height = 300,
  showLegend = true,
  doughnut = true
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Cores padrão para o gráfico
  const defaultColors = [
    'rgb(99, 102, 241)',   // Indigo
    'rgb(239, 68, 68)',    // Red
    'rgb(16, 185, 129)',   // Green
    'rgb(245, 158, 11)',   // Amber
    'rgb(59, 130, 246)',   // Blue
    'rgb(217, 70, 239)',   // Purple
    'rgb(20, 184, 166)',   // Teal
    'rgb(249, 115, 22)',   // Orange
    'rgb(139, 92, 246)',   // Violet
    'rgb(236, 72, 153)'    // Pink
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    // Destruir gráfico existente se houver
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Preparar dados para o gráfico
    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);
    const colors = data.map((item, index) => item.color || defaultColors[index % defaultColors.length]);

    // Configuração do gráfico
    const config: ChartConfiguration = {
      type: doughnut ? 'doughnut' : 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: 'white',
            borderWidth: 2,
            hoverOffset: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'right',
            labels: {
              padding: 20,
              boxWidth: 12,
              boxHeight: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value * 100) / total);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        cutout: doughnut ? '60%' : undefined
      }
    };

    // Criar gráfico
    chartInstance.current = new Chart(ctx, config);

    // Cleanup ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, doughnut, showLegend]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          {data.length > 0 ? (
            <canvas ref={chartRef} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sem dados disponíveis para o período selecionado.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
