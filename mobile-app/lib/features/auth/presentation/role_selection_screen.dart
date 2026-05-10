import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/role_provider.dart';

class RoleSelectionScreen extends ConsumerStatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  ConsumerState<RoleSelectionScreen> createState() =>
      _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends ConsumerState<RoleSelectionScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _fadeCtrl;
  late final Animation<double> _fade;
  UserRole? _selected;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 500));
    _fade = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _fadeCtrl.forward();
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    super.dispose();
  }

  void _selectRole(UserRole role) {
    setState(() => _selected = role);
  }

  void _continue() {
    if (_selected == null) return;
    ref.read(roleProvider.notifier).state = _selected!;
    if (_selected == UserRole.barista) {
      context.go('/barista');
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: FadeTransition(
        opacity: _fade,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                const SizedBox(height: 32),

                Text(
                  'COFECITO',
                  style: AppTypography.headlineLg.copyWith(
                    color: AppColors.primary,
                    letterSpacing: 6,
                  ),
                ),

                const SizedBox(height: 32),

                Expanded(
                  child: Column(
                    children: [
                      Expanded(
                        child: _RoleCard(
                          role: UserRole.coffeeLover,
                          label: 'Soy Coffee Lover',
                          icon: Icons.coffee_outlined,
                          gradientColors: const [
                            Color(0xFF3B2010),
                            Color(0xFF1A0D05),
                          ],
                          isSelected: _selected == UserRole.coffeeLover,
                          onTap: () => _selectRole(UserRole.coffeeLover),
                        ),
                      ),

                      const SizedBox(height: 12),

                      Expanded(
                        child: _RoleCard(
                          role: UserRole.barista,
                          label: 'Soy Barista',
                          icon: Icons.coffee_maker_outlined,
                          gradientColors: const [
                            Color(0xFF1A1200),
                            Color(0xFF0A0800),
                          ],
                          isSelected: _selected == UserRole.barista,
                          onTap: () => _selectRole(UserRole.barista),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                _ContinueButton(
                  enabled: _selected != null,
                  onPressed: _continue,
                ),

                const SizedBox(height: 16),

                Row(
                  children: [
                    const Expanded(child: Divider(color: Color(0xFF2A2A2A))),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'O CONTINUA CON',
                        style: AppTypography.labelSm
                            .copyWith(color: AppColors.onSurfaceVariant.withValues(alpha: 0.5)),
                      ),
                    ),
                    const Expanded(child: Divider(color: Color(0xFF2A2A2A))),
                  ],
                ),

                const SizedBox(height: 16),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _SocialButton(icon: Icons.login_rounded, onTap: () {}),
                    const SizedBox(width: 16),
                    _SocialButton(icon: Icons.fingerprint_rounded, onTap: () {}),
                    const SizedBox(width: 16),
                    _SocialButton(icon: Icons.people_alt_outlined, onTap: () {}),
                  ],
                ),

                const SizedBox(height: 24),

                Text(
                  '"Cada taza cuenta una historia"',
                  style: AppTypography.bodyMdVariant.copyWith(
                    fontStyle: FontStyle.italic,
                    fontSize: 13,
                    color: AppColors.onSurfaceVariant.withValues(alpha: 0.5),
                  ),
                ),

                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.role,
    required this.label,
    required this.icon,
    required this.gradientColors,
    required this.isSelected,
    required this.onTap,
  });

  final UserRole role;
  final String label;
  final IconData icon;
  final List<Color> gradientColors;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.primary.withValues(alpha: 0.8)
                : AppColors.outlineVariant.withValues(alpha: 0.2),
            width: isSelected ? 1.5 : 1,
          ),
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  )
                ]
              : null,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(19),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CustomPaint(painter: _GrainPainter()),

              if (isSelected)
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment.center,
                        radius: 0.8,
                        colors: [
                          AppColors.primary.withValues(alpha: 0.06),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ),

              Positioned(
                top: 0,
                left: 40,
                right: 40,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 1,
                  color: isSelected
                      ? AppColors.primary.withValues(alpha: 0.6)
                      : AppColors.primary.withValues(alpha: 0.1),
                ),
              ),

              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.primary.withValues(
                            alpha: isSelected ? 0.8 : 0.4),
                        width: 1.5,
                      ),
                      color: AppColors.primary.withValues(alpha: 0.08),
                    ),
                    child: Icon(
                      icon,
                      color: AppColors.primary,
                      size: 26,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    label,
                    style: AppTypography.headlineMd.copyWith(
                      fontSize: 20,
                      color: isSelected
                          ? AppColors.onSurface
                          : AppColors.onSurface.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),

              if (isSelected)
                Positioned(
                  top: 14,
                  right: 14,
                  child: Container(
                    width: 22,
                    height: 22,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary,
                    ),
                    child: const Icon(Icons.check_rounded,
                        color: AppColors.onPrimary, size: 14),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GrainPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rng = _SimpleRng();
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.018)
      ..style = PaintingStyle.fill;
    for (var i = 0; i < 600; i++) {
      canvas.drawCircle(
        Offset(rng.next() * size.width, rng.next() * size.height),
        rng.next() * 1.2,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

class _SimpleRng {
  int _seed = 12345;
  double next() {
    _seed = (_seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (_seed & 0xFFFF) / 0xFFFF;
  }
}

class _ContinueButton extends StatelessWidget {
  const _ContinueButton({required this.enabled, required this.onPressed});
  final bool enabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: enabled ? 1.0 : 0.55,
      duration: const Duration(milliseconds: 200),
      child: SizedBox(
        width: double.infinity,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: enabled
                ? const LinearGradient(
                    colors: [AppColors.primaryFixed, AppColors.primaryContainer],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  )
                : null,
            color: enabled ? null : AppColors.surfaceContainerHigh,
            borderRadius: BorderRadius.circular(100),
            boxShadow: enabled
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    )
                  ]
                : null,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(100),
              onTap: enabled ? onPressed : null,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  'Ingresar con Email',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyMdBold.copyWith(
                    color: enabled ? AppColors.onPrimary : AppColors.onSurfaceVariant,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.surfaceContainerHigh,
          border: Border.all(
              color: AppColors.outlineVariant.withValues(alpha: 0.3)),
        ),
        child: Icon(icon, color: AppColors.onSurfaceVariant, size: 22),
      ),
    );
  }
}
