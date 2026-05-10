import 'package:flutter_riverpod/flutter_riverpod.dart';

enum UserRole { none, coffeeLover, barista }

final roleProvider = StateProvider<UserRole>((_) => UserRole.none);
