class TastingNote {
  const TastingNote({
    required this.fragrance,
    required this.aroma,
    required this.flavor,
    required this.body,
    required this.acidity,
    required this.sweetness,
    this.aftertaste = 0.0,
    this.flavorNotes = const [],
    this.personalNote = '',
  });

  final double fragrance;
  final double aroma;
  final double flavor;
  final double body;
  final double acidity;
  final double sweetness;
  final double aftertaste;

  final List<String> flavorNotes;

  final String personalNote;

  double get cuppingScore {
    final avg = (fragrance + aroma + flavor + body + acidity + sweetness) / 6;
    return 70 + (avg - 1) * (30 / 4);
  }

  TastingNote copyWith({
    double? fragrance,
    double? aroma,
    double? flavor,
    double? body,
    double? acidity,
    double? sweetness,
    double? aftertaste,
    List<String>? flavorNotes,
    String? personalNote,
  }) {
    return TastingNote(
      fragrance: fragrance ?? this.fragrance,
      aroma: aroma ?? this.aroma,
      flavor: flavor ?? this.flavor,
      body: body ?? this.body,
      acidity: acidity ?? this.acidity,
      sweetness: sweetness ?? this.sweetness,
      aftertaste: aftertaste ?? this.aftertaste,
      flavorNotes: flavorNotes ?? this.flavorNotes,
      personalNote: personalNote ?? this.personalNote,
    );
  }

  Map<String, double> get radarValues => {
    'Fragancia': fragrance,
    'Aroma': aroma,
    'Sabor': flavor,
    'Cuerpo': body,
    'Acidez': acidity,
    'Dulzor': sweetness,
  };

  static const empty = TastingNote(
    fragrance: 3,
    aroma: 3,
    flavor: 3,
    body: 3,
    acidity: 3,
    sweetness: 3,
  );
}

abstract final class FlavorNotes {
  static const all = [
    FlavorNote(label: 'Chocolate', emoji: '🍫', category: 'dulce'),
    FlavorNote(label: 'Caramelo', emoji: '🍬', category: 'dulce'),
    FlavorNote(label: 'Miel',     emoji: '🍯', category: 'dulce'),
    FlavorNote(label: 'Vainilla', emoji: '🌿', category: 'dulce'),
    FlavorNote(label: 'Floral',   emoji: '🌸', category: 'floral'),
    FlavorNote(label: 'Jazmín',   emoji: '💐', category: 'floral'),
    FlavorNote(label: 'Rosas',    emoji: '🌹', category: 'floral'),
    FlavorNote(label: 'Cítrico',  emoji: '🍋', category: 'frutal'),
    FlavorNote(label: 'Frutado',  emoji: '🍓', category: 'frutal'),
    FlavorNote(label: 'Durazno',  emoji: '🍑', category: 'frutal'),
    FlavorNote(label: 'Maracuyá',emoji: '🟡', category: 'frutal'),
    FlavorNote(label: 'Nuez',     emoji: '🌰', category: 'nuez'),
    FlavorNote(label: 'Almendra', emoji: '🤎', category: 'nuez'),
    FlavorNote(label: 'Especias', emoji: '🌶️', category: 'especias'),
  ];
}

class FlavorNote {
  const FlavorNote({
    required this.label,
    required this.emoji,
    required this.category,
  });

  final String label;
  final String emoji;
  final String category;
}
