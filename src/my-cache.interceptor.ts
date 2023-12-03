import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { RedisClientType } from 'redis';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class MyCacheInterceptor implements NestInterceptor {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  @Inject(HttpAdapterHost)
  // Nest 底层可以切换 express、fastify 等库，而这些库都会实现一个通用的适配器，就是 HttpAdapter。
  private httpAdapterHost: HttpAdapterHost;

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const key = this.httpAdapterHost.httpAdapter.getRequestUrl(request);

    const value = await this.redisClient.get(key);

    // 如果查到了 key，就直接返回 value，这里要返回 rxjs 的 Observable 对象，所以用 of 包一下。
    if (value) return of(value);

    // 否则，执行 handler 并且设置到 redis 里。
    return next.handle().pipe(
      tap((res) => {
        this.redisClient.set(key, res);
      }),
    );
  }
}
