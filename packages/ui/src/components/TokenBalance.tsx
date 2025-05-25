import React from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, StyleSheet, View, Text } from 'react-native';

interface TokenBalanceProps {
  balance: number;
  symbol?: string;
  onPress?: () => void;
  testID?: string;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  balance,
  symbol = 'FUSE',
  onPress,
  testID = 'token-balance'
}) => {
  const { t } = useTranslation();
  
  const handlePress = () => {
    if (onPress) {
      AccessibilityInfo.announceForAccessibility(
        t('accessibility.tokenBalance', { balance, symbol })
      );
      onPress();
    }
  };
  
  return (
    <View 
      style={styles.container} 
      accessible={true}
      accessibilityLabel={t('accessibility.tokenBalance', { balance, symbol })}
      testID={testID}
      onTouchEnd={handlePress}
    >
      <View>
        <Text style={styles.label}>{t('wallet.yourBalance')}</Text>
        <Text style={styles.value}>{balance} {symbol}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{symbol.charAt(0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8
  },
  // Additional styles...
});