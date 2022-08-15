/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-07-20 16:29:22
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2022-08-15 10:47:18
 * @Description: 
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 不要开启. amis 不支持 strict mode
  experimental: {
    images: {
      unoptimized: true
    }
  },
  cache: false
}

module.exports = nextConfig
