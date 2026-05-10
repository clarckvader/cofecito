import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

class CofecitorAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CofecitorAppBar({
    super.key,
    this.title = 'COFECITO',
    this.leading,
    this.actions,
    this.showWalletAction = false,
    this.onWalletTap,
  });

  final String title;
  final Widget? leading;
  final List<Widget>? actions;
  final bool showWalletAction;
  final VoidCallback? onWalletTap;

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: preferredSize.height + MediaQuery.of(context).padding.top,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.9),
        border: Border(
          bottom: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.15)),
        ),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 64,
            child: leading != null
                ? Center(child: leading)
                : const SizedBox.shrink(),
          ),

          Expanded(
            child: Center(
              child: Text(
                title,
                style: GoogleFonts.sora(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                  letterSpacing: 3,
                ),
              ),
            ),
          ),

          SizedBox(
            width: 64,
            child: (actions != null || showWalletAction)
                ? Center(
                    child: actions != null
                        ? Row(mainAxisSize: MainAxisSize.min, children: actions!)
                        : IconButton(
                            icon: const Icon(Icons.account_balance_wallet_outlined),
                            color: AppColors.primary,
                            onPressed: onWalletTap,
                          ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}
