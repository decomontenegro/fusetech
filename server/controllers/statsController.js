/**
 * Controlador de Estatísticas
 * 
 * Este controlador gerencia todas as operações relacionadas a estatísticas,
 * incluindo cálculos, agregações e análises de dados.
 */

const Activity = require('../models/Activity');
const User = require('../models/User');
const League = require('../models/League');
const Team = require('../models/Team');
const mongoose = require('mongoose');

/**
 * Obter estatísticas gerais do usuário
 * @route GET /api/stats/user
 * @access Private
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar atividades do usuário
    const activities = await Activity.find({ user: userId });
    
    // Calcular estatísticas gerais
    const stats = {
      totalActivities: activities.length,
      totalDistance: 0,
      totalDuration: 0,
      totalElevation: 0,
      totalCalories: 0,
      activityTypes: {},
      averages: {
        distance: 0,
        duration: 0,
        elevation: 0,
        calories: 0
      },
      streaks: {
        current: 0,
        longest: 0
      },
      recentActivity: null
    };
    
    // Mapear datas de atividades para cálculo de sequência
    const activityDates = new Set();
    
    // Processar atividades
    activities.forEach(activity => {
      // Somar totais
      stats.totalDistance += activity.distance || 0;
      stats.totalDuration += activity.duration || 0;
      stats.totalElevation += activity.elevationGain || 0;
      stats.totalCalories += activity.calories || 0;
      
      // Contar por tipo
      const type = activity.type || 'unknown';
      stats.activityTypes[type] = (stats.activityTypes[type] || 0) + 1;
      
      // Adicionar data para cálculo de sequência
      const date = new Date(activity.startDate);
      activityDates.add(date.toISOString().split('T')[0]);
      
      // Atualizar atividade mais recente
      if (!stats.recentActivity || new Date(activity.startDate) > new Date(stats.recentActivity.startDate)) {
        stats.recentActivity = {
          id: activity._id,
          type: activity.type,
          name: activity.name,
          startDate: activity.startDate,
          distance: activity.distance,
          duration: activity.duration
        };
      }
    });
    
    // Calcular médias
    if (activities.length > 0) {
      stats.averages.distance = stats.totalDistance / activities.length;
      stats.averages.duration = stats.totalDuration / activities.length;
      stats.averages.elevation = stats.totalElevation / activities.length;
      stats.averages.calories = stats.totalCalories / activities.length;
    }
    
    // Calcular sequências
    if (activityDates.size > 0) {
      // Implementar cálculo de sequência atual e mais longa
      // ...
    }
    
    // Buscar ligas e competições
    const leagues = await League.find({ 'members.user': userId }).countDocuments();
    const teams = await Team.find({ 'members.user': userId }).countDocuments();
    
    // Adicionar contagens
    stats.leaguesCount = leagues;
    stats.teamsCount = teams;
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas do usuário' });
  }
};

/**
 * Obter estatísticas de uma atividade específica
 * @route GET /api/stats/activities/:id
 * @access Private
 */
exports.getActivityStats = async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({ error: 'ID de atividade inválido' });
    }
    
    // Buscar atividade
    const activity = await Activity.findById(activityId);
    
    // Verificar se a atividade existe
    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    // Verificar permissão
    if (activity.user.toString() !== userId) {
      return res.status(403).json({ error: 'Sem permissão para acessar esta atividade' });
    }
    
    // Calcular estatísticas da atividade
    const stats = {
      // Estatísticas básicas
      distance: activity.distance,
      duration: activity.duration,
      elevationGain: activity.elevationGain,
      calories: activity.calories,
      
      // Estatísticas de ritmo
      avgPace: activity.duration && activity.distance ? activity.duration / activity.distance : null,
      bestPace: null, // Calcular com base em splits
      
      // Estatísticas de frequência cardíaca
      avgHeartRate: activity.avgHeartRate,
      maxHeartRate: activity.maxHeartRate,
      heartRateZones: [], // Calcular com base em dados de frequência cardíaca
      
      // Estatísticas de cadência
      avgCadence: activity.avgCadence,
      maxCadence: activity.maxCadence,
      
      // Estatísticas de potência (para ciclismo)
      avgPower: activity.avgPower,
      maxPower: activity.maxPower,
      normalizedPower: activity.normalizedPower,
      
      // Análise de splits
      splits: activity.splits || [],
      
      // Comparação com médias do usuário
      comparison: {}
    };
    
    // Buscar atividades similares para comparação
    const similarActivities = await Activity.find({
      user: userId,
      type: activity.type,
      _id: { $ne: activityId }
    }).sort({ startDate: -1 }).limit(10);
    
    // Calcular médias para comparação
    if (similarActivities.length > 0) {
      const avgDistance = similarActivities.reduce((sum, act) => sum + (act.distance || 0), 0) / similarActivities.length;
      const avgDuration = similarActivities.reduce((sum, act) => sum + (act.duration || 0), 0) / similarActivities.length;
      const avgElevation = similarActivities.reduce((sum, act) => sum + (act.elevationGain || 0), 0) / similarActivities.length;
      const avgCalories = similarActivities.reduce((sum, act) => sum + (act.calories || 0), 0) / similarActivities.length;
      
      stats.comparison = {
        distance: {
          value: activity.distance,
          avg: avgDistance,
          diff: activity.distance - avgDistance,
          diffPercent: avgDistance ? ((activity.distance - avgDistance) / avgDistance) * 100 : 0
        },
        duration: {
          value: activity.duration,
          avg: avgDuration,
          diff: activity.duration - avgDuration,
          diffPercent: avgDuration ? ((activity.duration - avgDuration) / avgDuration) * 100 : 0
        },
        elevation: {
          value: activity.elevationGain,
          avg: avgElevation,
          diff: activity.elevationGain - avgElevation,
          diffPercent: avgElevation ? ((activity.elevationGain - avgElevation) / avgElevation) * 100 : 0
        },
        calories: {
          value: activity.calories,
          avg: avgCalories,
          diff: activity.calories - avgCalories,
          diffPercent: avgCalories ? ((activity.calories - avgCalories) / avgCalories) * 100 : 0
        }
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error(`Error fetching activity stats for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas da atividade' });
  }
};

/**
 * Obter estatísticas semanais
 * @route GET /api/stats/weekly
 * @access Private
 */
exports.getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, week, activityType } = req.query;
    
    // Calcular datas de início e fim da semana
    let startDate, endDate;
    
    if (year && week) {
      // Calcular com base no ano e número da semana
      // ...
    } else {
      // Semana atual
      const now = new Date();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Domingo
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sábado
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Construir filtro
    const filter = {
      user: userId,
      startDate: { $gte: startDate, $lte: endDate }
    };
    
    if (activityType) {
      filter.type = activityType;
    }
    
    // Buscar atividades
    const activities = await Activity.find(filter).sort({ startDate: 1 });
    
    // Inicializar estatísticas por dia
    const dailyStats = Array(7).fill().map(() => ({
      activities: 0,
      distance: 0,
      duration: 0,
      elevation: 0,
      calories: 0
    }));
    
    // Processar atividades
    activities.forEach(activity => {
      const date = new Date(activity.startDate);
      const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
      
      dailyStats[dayOfWeek].activities++;
      dailyStats[dayOfWeek].distance += activity.distance || 0;
      dailyStats[dayOfWeek].duration += activity.duration || 0;
      dailyStats[dayOfWeek].elevation += activity.elevationGain || 0;
      dailyStats[dayOfWeek].calories += activity.calories || 0;
    });
    
    // Calcular totais
    const totals = {
      activities: activities.length,
      distance: activities.reduce((sum, act) => sum + (act.distance || 0), 0),
      duration: activities.reduce((sum, act) => sum + (act.duration || 0), 0),
      elevation: activities.reduce((sum, act) => sum + (act.elevationGain || 0), 0),
      calories: activities.reduce((sum, act) => sum + (act.calories || 0), 0)
    };
    
    res.json({
      startDate,
      endDate,
      dailyStats,
      totals
    });
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas semanais' });
  }
};

/**
 * Obter estatísticas mensais
 * @route GET /api/stats/monthly
 * @access Private
 */
exports.getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month, activityType } = req.query;
    
    // Calcular datas de início e fim do mês
    let startDate, endDate;
    
    if (year && month) {
      // Calcular com base no ano e mês
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Mês atual
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Construir filtro
    const filter = {
      user: userId,
      startDate: { $gte: startDate, $lte: endDate }
    };
    
    if (activityType) {
      filter.type = activityType;
    }
    
    // Buscar atividades
    const activities = await Activity.find(filter).sort({ startDate: 1 });
    
    // Inicializar estatísticas por semana
    const weeklyStats = Array(5).fill().map(() => ({
      activities: 0,
      distance: 0,
      duration: 0,
      elevation: 0,
      calories: 0
    }));
    
    // Processar atividades
    activities.forEach(activity => {
      const date = new Date(activity.startDate);
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
      
      weeklyStats[weekOfMonth].activities++;
      weeklyStats[weekOfMonth].distance += activity.distance || 0;
      weeklyStats[weekOfMonth].duration += activity.duration || 0;
      weeklyStats[weekOfMonth].elevation += activity.elevationGain || 0;
      weeklyStats[weekOfMonth].calories += activity.calories || 0;
    });
    
    // Calcular totais
    const totals = {
      activities: activities.length,
      distance: activities.reduce((sum, act) => sum + (act.distance || 0), 0),
      duration: activities.reduce((sum, act) => sum + (act.duration || 0), 0),
      elevation: activities.reduce((sum, act) => sum + (act.elevationGain || 0), 0),
      calories: activities.reduce((sum, act) => sum + (act.calories || 0), 0)
    };
    
    // Calcular médias por atividade
    const averages = {
      distance: totals.activities ? totals.distance / totals.activities : 0,
      duration: totals.activities ? totals.duration / totals.activities : 0,
      elevation: totals.activities ? totals.elevation / totals.activities : 0,
      calories: totals.activities ? totals.calories / totals.activities : 0
    };
    
    res.json({
      startDate,
      endDate,
      weeklyStats,
      totals,
      averages
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas mensais' });
  }
};

/**
 * Obter recordes pessoais
 * @route GET /api/stats/personal-records
 * @access Private
 */
exports.getPersonalRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar atividades do usuário
    const activities = await Activity.find({ user: userId });
    
    // Inicializar recordes
    const records = {
      distance: {
        running: { value: 0, activity: null },
        cycling: { value: 0, activity: null },
        walking: { value: 0, activity: null },
        swimming: { value: 0, activity: null }
      },
      duration: {
        running: { value: 0, activity: null },
        cycling: { value: 0, activity: null },
        walking: { value: 0, activity: null },
        swimming: { value: 0, activity: null }
      },
      elevation: {
        running: { value: 0, activity: null },
        cycling: { value: 0, activity: null },
        hiking: { value: 0, activity: null }
      },
      pace: {
        running: { value: Infinity, activity: null }, // Menor é melhor
        cycling: { value: Infinity, activity: null },
        walking: { value: Infinity, activity: null }
      }
    };
    
    // Processar atividades
    activities.forEach(activity => {
      const type = activity.type;
      
      // Verificar se o tipo é suportado
      if (!records.distance[type] && !records.duration[type]) {
        return;
      }
      
      // Verificar recorde de distância
      if (records.distance[type] && activity.distance > records.distance[type].value) {
        records.distance[type] = {
          value: activity.distance,
          activity: {
            id: activity._id,
            name: activity.name,
            date: activity.startDate
          }
        };
      }
      
      // Verificar recorde de duração
      if (records.duration[type] && activity.duration > records.duration[type].value) {
        records.duration[type] = {
          value: activity.duration,
          activity: {
            id: activity._id,
            name: activity.name,
            date: activity.startDate
          }
        };
      }
      
      // Verificar recorde de elevação
      if (records.elevation[type] && activity.elevationGain > records.elevation[type].value) {
        records.elevation[type] = {
          value: activity.elevationGain,
          activity: {
            id: activity._id,
            name: activity.name,
            date: activity.startDate
          }
        };
      }
      
      // Verificar recorde de ritmo (menor é melhor)
      if (records.pace[type] && activity.distance > 0) {
        const pace = activity.duration / activity.distance;
        if (pace < records.pace[type].value) {
          records.pace[type] = {
            value: pace,
            activity: {
              id: activity._id,
              name: activity.name,
              date: activity.startDate
            }
          };
        }
      }
    });
    
    // Limpar recordes não definidos
    Object.keys(records).forEach(category => {
      Object.keys(records[category]).forEach(type => {
        if (records[category][type].value === 0 || records[category][type].value === Infinity) {
          records[category][type] = null;
        }
      });
    });
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching personal records:', error);
    res.status(500).json({ error: 'Erro ao buscar recordes pessoais' });
  }
};

// Exportar controlador
module.exports = exports;
