import 'package:flutter/material.dart';

abstract final class AppColors {
  static const background = Color(0xFF131313);
  static const surface = Color(0xFF131313);
  static const surfaceDim = Color(0xFF131313);
  static const surfaceBright = Color(0xFF3A3939);
  static const surfaceContainerLowest = Color(0xFF0E0E0E);
  static const surfaceContainerLow = Color(0xFF1C1B1B);
  static const surfaceContainer = Color(0xFF201F1F);
  static const surfaceContainerHigh = Color(0xFF2A2A2A);
  static const surfaceContainerHighest = Color(0xFF353534);

  static const primary = Color(0xFFE6C364);
  static const primaryFixed = Color(0xFFFFE08F);
  static const primaryFixedDim = Color(0xFFE6C364);
  static const primaryContainer = Color(0xFFC9A84C);
  static const onPrimary = Color(0xFF3D2E00);
  static const onPrimaryFixed = Color(0xFF241A00);
  static const onPrimaryFixedVariant = Color(0xFF584400);
  static const onPrimaryContainer = Color(0xFF503D00);
  static const inversePrimary = Color(0xFF755B00);
  static const surfaceTint = Color(0xFFE6C364);

  static const secondary = Color(0xFFD6C59F);
  static const secondaryFixed = Color(0xFFF3E1B9);
  static const secondaryFixedDim = Color(0xFFD6C59F);
  static const secondaryContainer = Color(0xFF53482B);
  static const onSecondary = Color(0xFF392F14);
  static const onSecondaryFixed = Color(0xFF231A03);
  static const onSecondaryContainer = Color(0xFFC7B792);

  static const tertiary = Color(0xFFD3C5A9);
  static const tertiaryFixed = Color(0xFFF0E1C3);
  static const tertiaryFixedDim = Color(0xFFD3C5A8);
  static const tertiaryContainer = Color(0xFFB7AA8F);
  static const onTertiary = Color(0xFF38301B);
  static const onTertiaryFixed = Color(0xFF221B08);

  static const onBackground = Color(0xFFE5E2E1);
  static const onSurface = Color(0xFFE5E2E1);
  static const onSurfaceVariant = Color(0xFFD0C5B2);
  static const inverseSurface = Color(0xFFE5E2E1);
  static const inverseOnSurface = Color(0xFF313030);

  static const outline = Color(0xFF99907E);
  static const outlineVariant = Color(0xFF4D4637);

  static const error = Color(0xFFFFB4AB);
  static const onError = Color(0xFF690005);
  static const errorContainer = Color(0xFF93000A);
  static const onErrorContainer = Color(0xFFFFDAD6);

  static const goldGradient = LinearGradient(
    colors: [primaryFixed, primaryContainer],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const cardOverlayGradient = LinearGradient(
    colors: [Colors.transparent, Color(0xCC0A0A0A)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
