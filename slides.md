---
# try also 'default' to start simple
theme: default
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
layout: cover
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
drawings:
  persist: false
# use UnoCSS
css: unocss
---

# my-coffeeshop 项目指南
参考自 go-coffeeshop

**设计** - 领域驱动设计（DDD）可落地的设计模式
<br>
<br>
**技术** - Go生态在设计中的使用

---

# 六边形架构
<br>
<img src="/6.png" class="h-[80%] mx-auto" />

---

# 整洁架构(The Clean Architecture)
<br>
<img src="/clean-architecture.webp" class="h-[80%] mx-auto" />


---

# [整洁架构全景](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)

<img src="/explicit-architecture.png" class="h-[80%] mx-auto" />

---

# 技术篇(框架和驱动层)

<img src="/explicit-architecture-adopter.png" class="h-[80%] float-right" />

<br>
<br>
<br>
<br>

- Server Adopter
- ORM Adopter
- MQ Adopter

---

# Protocol Buffers 与 gRPC
Server Adopter


- **Protocol Buffers** 是一种接口定义语言（IDL，Interface Description Language）
- **Protocol Buffers** 是一种序跨语言、可扩展的序列化结构化数据
  - 本身使用C++编写，通过插件的实行扩张，支持编译成多语言使用
  - 主要功能是高效的对数据进行编解码
  - 可以以**插件**的形式进行扩展
- **gRPC** 是一个开源高性能的远程调用框架
  - 基于HTTP/2
  - 使用 Protocol Buffers 作为序列化结构化数据传输
  - 跨语言的实现，不同的语言基于的通讯框架和机制不同
  - 支持拦截器

---

# Protocol Buffers 基本语法

### 有 message 和 service 组成

```proto {all|1-6|2|3|4|5|1-6|7-16|8-9|10-11|12-13|14-15|all}
message EchoRequest {
  // 字段规则 类型 名称 = 字段编号;
  required string name = 1; // 字段规则：required, optional, repeated
  optional int32 id = 2;    // 类型：int32、int64、sint32、sint64、string、32-bit ....
  repeated string snippets = 3; // 字段编号：0 ~ 536870911（除去 19000 到 19999 之间的数字）
}
service Echo { // gRPC支持四种通讯方式
  // 简单 RPC / UnaryAPI
  rpc UnaryEcho(EchoRequest) returns (EchoResponse) {}
  // 服务端流式 RPC / ServerStreaming
  rpc ServerStreamingEcho(EchoRequest) returns (stream EchoResponse) {}
  // 客户端流式 RPC / ClientStreaming
  rpc ClientStreamingEcho(stream EchoRequest) returns (EchoResponse) {}
  // 双向流式 RPC / BidirectionalStreaming
  rpc BidirectionalStreamingEcho(stream EchoRequest) returns (stream EchoResponse) {}
}

// echo.proto
```
---

# Server Adopter
### 使用protobuf对server规范进行约束

1. 安装**protobuf** - protobuf支持插件，所以后来在protobuf基础上可以走很多扩展，插件的变多，生成代码命令会变得复杂，如
```shell
protoc -I=proto \
   --go_out=proto --go_opt=paths=source_relative \
   --go-grpc_out=proto --go-grpc_opt=paths=source_relative \
   --grpc-gateway_out=proto --grpc-gateway_opt=paths=source_relative \
   helloworld/hello_world.proto
```
2. 在protobuf文件中可以导入一些公用的基础protobuf文件，如
```proto
import "google/api/annotations.proto";
```
3. 安装[**buf**](buf.build), 帮助管理protobuf插件和导入的公共protobuf文件，在proto目录下执行`buf mod init` 会生成 buf.yaml文件如下添加deps，并执行 `buf build`,会生成一个 `buf.lock`
```yaml
version: v1
deps:
  - buf.build/googleapis/googleapis
  - buf.build/grpc-ecosystem/grpc-gateway
```

---

# 使用protobuf生成Server规范约束

4. 在根部目录下添加`buf.work.yaml`和`buf.gen.yaml`,其中为proto的代码生成规则，
```yaml
version: v1
plugins:
  - remote: buf.build/library/plugins/go:v1.27.1-1
    out: proto/gen
    opt:
      - paths=source_relative
  - remote: buf.build/library/plugins/go-grpc:v1.1.0-2
    out: proto/gen
    opt:
      - paths=source_relative
  - remote: buf.build/grpc-ecosystem/plugins/grpc-gateway:v2.6.0-1
    out: proto/gen
    opt:
      - paths=source_relative
  - remote: buf.build/grpc-ecosystem/plugins/openapiv2:v2.6.0-1
    out: third_party/openapiv2
```


   
  
---

# 生成 gRPC Server和 Stub 代码

5. 执行`buf generate`,生成gRPC Server和 Stub 代码，已经swagger.json

<img src="/gen.png" class="w-[300px] float-right" />
<br>
- 使用`google.golang.org/protobuf` 作为gRPC框架
```go
import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
)
```
<br>

- 使用`google.golang.org/protobuf` 编码库
```go
import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
)
```
---

# Server Adopter

---




# 框架和驱动中的Golang技术


Use code snippets and get the highlighting directly![^1]

```ts {all|2|1-6|9|all}
interface User {
  id: number
  firstName: string
  lastName: string
  role: string
}

function updateUser(id: number, update: User) {
  const user = getUser(id)
  const newUser = { ...user, ...update }
  saveUser(id, newUser)
}
```

<arrow v-click="3" x1="400" y1="420" x2="230" y2="330" color="#564" width="3" arrowSize="1" />

[^1]: [Learn More](https://sli.dev/guide/syntax.html#line-highlighting)

<style>
.footnotes-sep {
  @apply mt-20 opacity-10;
}
.footnotes {
  @apply text-sm opacity-75;
}
.footnote-backref {
  display: none;
}
</style>


---



