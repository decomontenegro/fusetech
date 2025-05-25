import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@fuseapp/ui';
import { BarChart, Activity } from 'lucide-react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar componentes necessários do Chart.js
Chart.register(...registerables);

interface DataItem {
  label: string;
  value: number;
  target?: number;
  color?: string;
  targetColor?: string;
}

interface ProgressBarChartProps {
  title: string;
  data: DataItem[];
  unit?: string;
  height?: number;
  showLegend?: boolean;
  horizontal?: boolean;
}

export const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
  title,
  data,
  unit = '',
  height = 300,
  showLegend = true,
  horizontal = false
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
    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);
    const targets = data.map(item => item.target || 0);
    const colors = data.map(item => item.color || 'rgb(99, 102, 241)');
    const targetColors = data.map(item => item.targetColor || 'rgba(99, 102, 241, 0.3)');

    // Configuração do gráfico
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Atual',
            data: values,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Meta',
            data: targets,
            backgroundColor: targetColors,
            borderColor: targetColors,
            borderWidth: 1,
            borderRadius: 4,
            // Ocultar barras de meta se não houver valor
            hidden: targets.every(target => target === 0)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: {
          legend: {
            display: showLegend && targets.some(target => target > 0),
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
                  const value = horizontal ? context.parsed.x : context.parsed.y;
                  label += value + (unit ? ` ${unit}` : '');
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: !horizontal
            },
            ticks: {
              callback: function(value) {
                if (horizontal) {
                  return value + (unit ? ` ${unit}` : '');
                }
                return this.getLabelForValue(Number(value));
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: horizontal
            },
            ticks: {
              callback: function(value) {
                if (!horizontal) {
                  return value + (unit ? ` ${unit}` : '');
                }
                return this.getLabelForValue(Number(value));
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
  }, [data, unit, showLegend, horizontal]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart className="h-5 w-5 text-primary" />
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
