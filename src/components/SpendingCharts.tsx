import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { formatINR } from '../utils/format';

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  percent: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  total: number;
  txCount: number;
  txWord: string;
}

export function CategoryDonutChart({ slices, total, txCount, txWord }: DonutChartProps) {
  const size = 164;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <View style={styles.donutContainer}>
      <View style={styles.donutSvgWrap}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={COLORS.surfaceAlt}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {slices.map((slice) => {
              const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += slice.percent;

              return (
                <Circle
                  key={slice.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  fill="transparent"
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutTotal} numberOfLines={1} adjustsFontSizeToFit>
            {formatINR(total)}
          </Text>
          <Text style={styles.donutSub}>
            {txCount} {txWord}
          </Text>
        </View>
      </View>

      <View style={styles.legendCol}>
        {slices.slice(0, 5).map((slice) => (
          <View key={slice.id} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {slice.label}
            </Text>
            <Text style={styles.legendPct}>{slice.percent.toFixed(0)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export interface DayBarItem {
  label: string;
  amount: number;
  isHighlight?: boolean;
}

interface SevenDayBarChartProps {
  days: DayBarItem[];
}

export function SevenDayBarChart({ days }: SevenDayBarChartProps) {
  const width = 310;
  const height = 136;
  const chartTop = 22;
  const chartBottom = 108;
  const maxBarHeight = chartBottom - chartTop;
  const maxVal = Math.max(...days.map((d) => d.amount), 1);
  const slotWidth = width / Math.max(days.length, 1);
  const barWidth = 22;

  return (
    <View style={styles.barWrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {days.map((d, idx) => {
          const barHeight = d.amount > 0 ? Math.max((d.amount / maxVal) * maxBarHeight, 6) : 3;
          const x = idx * slotWidth + (slotWidth - barWidth) / 2;
          const y = chartBottom - barHeight;
          const fill =
            d.amount === 0
              ? COLORS.surfaceAlt
              : d.isHighlight
              ? COLORS.primary
              : '#38BDF8';

          return (
            <G key={`${d.label}-${idx}`}>
              {d.amount > 0 ? (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 6}
                  fontSize="9"
                  fontWeight="700"
                  fill={COLORS.textSecondary}
                  textAnchor="middle"
                >
                  {d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}k` : String(Math.round(d.amount))}
                </SvgText>
              ) : null}
              <Rect x={x} y={y} width={barWidth} height={barHeight} rx={6} fill={fill} />
              <SvgText
                x={x + barWidth / 2}
                y={126}
                fontSize="10"
                fontWeight="600"
                fill={d.isHighlight ? COLORS.primaryLight : COLORS.textMuted}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 14,
  },
  donutSvgWrap: {
    width: 164,
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    width: 98,
    alignItems: 'center',
  },
  donutTotal: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
  donutSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  legendCol: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  legendPct: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  barWrap: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
});
