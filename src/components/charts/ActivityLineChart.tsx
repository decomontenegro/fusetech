import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@fuseapp/ui';
import { LineChart, Activity } from 'lucide-react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar componentes necessários do Chart.js
Chart.register(...registerables);

interface DataPoint {
  date: string;
  value: number;
}

interface ActivityLineChartProps {
  title: string;
  data: DataPoint[];
  label: string;
  color?: string;
  unit?: string;
  height?: number;
  showLegend?: boolean;
}

export const ActivityLineChart: React.FC<ActivityLineChartProps> = ({
  title,
  data,
  label,
  color = 'rgb(99, 102, 241)',
  unit = '',
  height = 300,
  showLegend = true
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destruir gráfico existente se houver
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Preparar dados para o gráfico
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });

    const values = sortedData.map(item => item.value);

    // Configuração do gráfico
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data: values,
            borderColor: color,
            backgroundColor: `${color}33`, // Cor com 20% de opacidade
            tension: 0.3,
            fill: true,
            pointBackgroundColor: color,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'top',
            align: 'end'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y + (unit ? ` ${unit}` : '');
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + (unit ? ` ${unit}` : '');
              }
            }
          }
        }
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
  }, [data, label, color, unit, showLegend]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <LineChart className="h-5 w-5 text-primary" />
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
