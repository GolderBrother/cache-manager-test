import {
  Controller,
  Get,
  Query,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MyCacheInterceptor } from './my-cache.interceptor';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(CACHE_MANAGER)
  private cacheManager: Cache;

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('set')
  async set(@Query('value') value: string) {
    await this.cacheManager.set('aaa', value);
    return 'done';
  }

  @Get('get')
  get() {
    return this.cacheManager.get('aaa');
  }

  @Get('del')
  async del() {
    await this.cacheManager.del('aaa');
    return 'done';
  }

  @Get('aaa')
  // @UseInterceptors(CacheInterceptor)
  @UseInterceptors(MyCacheInterceptor)
  aaa(@Query('a') a: string) {
    // 参数不变的情况下，刷新几次，可以看到控制台只打印了一次：
    console.log('aaa', a);
    return a;
  }
}
