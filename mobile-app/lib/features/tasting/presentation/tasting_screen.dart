import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../data/models/cofecito_nft.dart';
import '../../../data/models/tasting_note.dart';
import '../../../shared/widgets/primary_button.dart';
import 'widgets/radar_chart_widget.dart';

final _tastingNoteProvider = StateProvider.family<TastingNote, String>(
  (ref, tokenId) {
    final nft = MockNFTs.collection.firstWhere(
      (n) => n.tokenId == tokenId,
      orElse: () => MockNFTs.collection.first,
    );
    return nft.tastingNote ?? TastingNote.empty;
  },
);

class TastingScreen extends ConsumerWidget {
  const TastingScreen({super.key, required this.tokenId});

  final String tokenId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nft = MockNFTs.collection.firstWhere(
      (n) => n.tokenId == tokenId,
      orElse: () => MockNFTs.collection.first,
    );
    final note = ref.watch(_tastingNoteProvider(tokenId));
    final notifier = ref.read(_tastingNoteProvider(tokenId).notifier);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _TastingAppBar(nft: nft),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _RadarSection(note: note),
                const SizedBox(height: 32),

                _AttributesSection(note: note, onChanged: (updated) {
                  notifier.state = updated;
                }),
                const SizedBox(height: 32),

                _FlavorNotesSection(
                  selected: note.flavorNotes,
                  onChanged: (notes) {
                    notifier.state = note.copyWith(flavorNotes: notes);
                  },
                ),
                const SizedBox(height: 32),

                _PersonalNoteSection(
                  value: note.personalNote,
                  onChanged: (text) {
                    notifier.state = note.copyWith(personalNote: text);
                  },
                ),
                const SizedBox(height: 32),

                PrimaryButton(
                  label: 'GUARDAR CATA',
                  icon: Icons.save_rounded,
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Cata guardada en tu NFT',
                          style: AppTypography.bodyMd.copyWith(color: AppColors.onPrimary),
                        ),
                        backgroundColor: AppColors.primaryContainer,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                SecondaryButton(
                  label: 'VER TRAZABILIDAD',
                  icon: Icons.route_rounded,
                  onPressed: () => context.push('/traceability/$tokenId'),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _TastingAppBar extends StatelessWidget {
  const _TastingAppBar({required this.nft});
  final CofecitoNFT nft;

  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 160,
      pinned: true,
      backgroundColor: AppColors.surfaceContainer,
      leading: IconButton(
        onPressed: () => context.pop(),
        icon: const Icon(Icons.arrow_back_ios_rounded, color: AppColors.primary),
      ),
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        title: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bitácora Sensorial',
              style: AppTypography.labelSmGold.copyWith(letterSpacing: 2),
            ),
            Text(
              nft.coffeeName,
              style: AppTypography.headlineMd.copyWith(fontSize: 16),
            ),
          ],
        ),
        background: DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.surfaceContainerHighest,
                AppColors.surfaceContainer,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Center(
            child: Icon(
              Icons.coffee_maker_rounded,
              size: 80,
              color: AppColors.primary.withValues(alpha: 0.1),
            ),
          ),
        ),
      ),
    );
  }
}

class _RadarSection extends StatelessWidget {
  const _RadarSection({required this.note});
  final TastingNote note;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Perfil Sensorial', style: AppTypography.headlineMd.copyWith(fontSize: 18)),
                    const SizedBox(height: 4),
                    Text(
                      'Análisis de 6 atributos SCA',
                      style: AppTypography.bodyMdVariant.copyWith(fontSize: 13),
                    ),
                  ],
                ),
              ),
              CuppingScoreRing(score: note.cuppingScore),
            ],
          ),
          const SizedBox(height: 20),
          SensoryRadarChart(note: note),
        ],
      ),
    );
  }
}

class _AttributesSection extends StatelessWidget {
  const _AttributesSection({required this.note, required this.onChanged});
  final TastingNote note;
  final ValueChanged<TastingNote> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Atributos de Cata', style: AppTypography.headlineMd.copyWith(fontSize: 18)),
          const SizedBox(height: 20),
          _buildSlider('Fragancia', note.fragrance, (v) => onChanged(note.copyWith(fragrance: v))),
          const SizedBox(height: 16),
          _buildSlider('Aroma', note.aroma, (v) => onChanged(note.copyWith(aroma: v))),
          const SizedBox(height: 16),
          _buildSlider('Sabor', note.flavor, (v) => onChanged(note.copyWith(flavor: v))),
          const SizedBox(height: 16),
          _buildSlider('Cuerpo', note.body, (v) => onChanged(note.copyWith(body: v))),
          const SizedBox(height: 16),
          _buildSlider('Acidez', note.acidity, (v) => onChanged(note.copyWith(acidity: v))),
          const SizedBox(height: 16),
          _buildSlider('Dulzor', note.sweetness, (v) => onChanged(note.copyWith(sweetness: v))),
        ],
      ),
    );
  }

  Widget _buildSlider(String label, double value, ValueChanged<double> cb) {
    return SensorySlider(label: label, value: value, onChanged: cb);
  }
}

class _FlavorNotesSection extends StatelessWidget {
  const _FlavorNotesSection({required this.selected, required this.onChanged});
  final List<String> selected;
  final ValueChanged<List<String>> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Notas Aromáticas', style: AppTypography.headlineMd.copyWith(fontSize: 18)),
          const SizedBox(height: 4),
          Text(
            'Selecciona las notas que percibes en esta taza',
            style: AppTypography.bodyMdVariant.copyWith(fontSize: 13),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: FlavorNotes.all.map((note) {
              final isSelected = selected.contains(note.label);
              return _FlavorChip(
                note: note,
                isSelected: isSelected,
                onTap: () {
                  final updated = List<String>.from(selected);
                  isSelected ? updated.remove(note.label) : updated.add(note.label);
                  onChanged(updated);
                },
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _FlavorChip extends StatelessWidget {
  const _FlavorChip({required this.note, required this.isSelected, required this.onTap});
  final FlavorNote note;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.18)
              : AppColors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: isSelected
                ? AppColors.primary.withValues(alpha: 0.5)
                : AppColors.outlineVariant.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(note.emoji, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(
              note.label,
              style: AppTypography.labelSm.copyWith(
                color: isSelected ? AppColors.primaryFixed : AppColors.onSurfaceVariant,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PersonalNoteSection extends StatefulWidget {
  const _PersonalNoteSection({required this.value, required this.onChanged});
  final String value;
  final ValueChanged<String> onChanged;

  @override
  State<_PersonalNoteSection> createState() => _PersonalNoteSectionState();
}

class _PersonalNoteSectionState extends State<_PersonalNoteSection> {
  late final _controller = TextEditingController(text: widget.value);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Nota del Catador', style: AppTypography.headlineMd.copyWith(fontSize: 18)),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            maxLines: 4,
            onChanged: widget.onChanged,
            style: AppTypography.bodyMd,
            decoration: InputDecoration(
              hintText: 'Describe tu experiencia con esta taza… ¿Qué te evocó?',
              hintStyle: AppTypography.bodyMdVariant.copyWith(fontSize: 14),
              alignLabelWithHint: true,
            ),
          ),
        ],
      ),
    );
  }
}
