// // src/auth/auth.module.ts
// import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { JwtStrategy } from './strategies/jwt.strategy';

// @Module({
//   imports: [
//     ConfigModule.forRoot(), // Add this
//     PassportModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule], // Add this
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => ({
//         secret: config.get<string>('JWT_SECRET'),
//         signOptions: { expiresIn: '1d' },
//       }),
//     }),
//   ],
//   providers: [JwtStrategy],
//   exports: [JwtModule],
// })
// export class AuthModule {}

// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
