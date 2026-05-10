class TraceabilityEvent {
  const TraceabilityEvent({
    required this.stage,
    required this.title,
    required this.description,
    required this.date,
    required this.icon,
    this.metadata = const {},
    this.isVerifiedOnChain = false,
    this.txHash,
  });

  final TraceabilityStage stage;
  final String title;
  final String description;
  final DateTime date;

  final String icon;

  final Map<String, String> metadata;

  final bool isVerifiedOnChain;
  final String? txHash;
}

enum TraceabilityStage {
  cultivation,
  processing,
  roasting,
  brewing,
}

extension TraceabilityStageLabel on TraceabilityStage {
  String get label => switch (this) {
    TraceabilityStage.cultivation => 'Cultivo',
    TraceabilityStage.processing  => 'Proceso',
    TraceabilityStage.roasting    => 'Tueste',
    TraceabilityStage.brewing     => 'Barista',
  };
}

abstract final class MockTraceability {
  static List<TraceabilityEvent> forLot042() => [
    TraceabilityEvent(
      stage: TraceabilityStage.cultivation,
      title: 'Finca El Mirador',
      description: 'Variedad Caturra cultivada por Don Aurelio Mamani. Cosecha manual de cerezas maduras seleccionadas.',
      date: DateTime(2024, 6, 15),
      icon: 'eco',
      metadata: {
        'Agricultor': 'Aurelio Mamani',
        'Altitud': '1,850 msnm',
        'Región': 'Yungas, La Paz',
        'Variedad': 'Caturra',
      },
      isVerifiedOnChain: true,
      txHash: '0x4a7f...3e2d',
    ),
    TraceabilityEvent(
      stage: TraceabilityStage.processing,
      title: 'Proceso Natural',
      description: 'Secado en camas africanas durante 28 días. Control de temperatura y volteo cada 6 horas para uniformidad.',
      date: DateTime(2024, 6, 20),
      icon: 'wb_sunny',
      metadata: {
        'Método': 'Natural (Dry)',
        'Días de secado': '28 días',
        'Humedad final': '10.5%',
        'Certificación': 'Orgánico',
      },
      isVerifiedOnChain: true,
      txHash: '0x9b2c...7f1a',
    ),
    TraceabilityEvent(
      stage: TraceabilityStage.roasting,
      title: 'Tueste Medio',
      description: 'Tostado artesanal en tambor Giesen W6A. Perfil de desarrollo 22% con temperatura de salida 203°C.',
      date: DateTime(2024, 8, 3),
      icon: 'local_fire_department',
      metadata: {
        'Nivel': 'Medio (Agtron 65)',
        'Temperatura salida': '203°C',
        'Tiempo total': '11 min 40 s',
        'Tostador': 'Cofecito Roasters BCB',
      },
      isVerifiedOnChain: true,
      txHash: '0x1d5e...a3c9',
    ),
    TraceabilityEvent(
      stage: TraceabilityStage.brewing,
      title: 'Pour Over V60',
      description: 'Preparado por Barista Certified SCA. Relación 1:15, agua 92°C. Bloom de 30 s con 40 ml.',
      date: DateTime(2024, 8, 10),
      icon: 'coffee',
      metadata: {
        'Método': 'Pour Over V60',
        'Molienda': 'Media (800 µm)',
        'Dosis': '18 g / 270 ml',
        'Barista': 'Valentina Quispe',
      },
      isVerifiedOnChain: false,
    ),
  ];
}
