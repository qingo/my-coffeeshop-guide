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

# 领域驱动设计微服务落地方案
go-coffeeshop 项目指南

**设计** - 领域驱动设计可落地的设计模式
<br>
<br>
**技术** - Go生态在设计中的使用

---

# go-coffee 项目简述

<img src="/coffeeshop.svg" class="w-[78%] float-right mt-10" />
<br>

### Web服务
- Web前端服务
- gRPC网关
- 商品服务/Product
- 收银台服务/Counter
- 咖啡师服务/Barista
- 厨房服务/Kitchen

<br>

### 思考
- 服务的划分规则
- 服务使用的技术



---

# 六边形架构
<br>
<img src="/6.png" class="h-[80%] float-right mr-20" />

### 领域模型主要组成部分

<br>

- **实体/Entity**
- **值对象/Object Value**
- **聚合(根)/Aggregate(Root)**
- **服务/Service**

<br>
<br>

### 问题

- 应用程序内领域服务描述不清楚
- 适配器技术描述不清楚

---

# 整洁架构(The Clean Architecture)
<br>
<img src="/clean-architecture.webp" class="h-[80%] mx-auto" />


---

# [整洁架构全景](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)

<img src="/explicit-architecture.png" class="h-[80%] mx-auto" />

---

# 整洁架构的项目目录参考

<br>

```
biz_module 业务模块
├── 📁 app                    // 整个领域逻辑被打包成一个application，由外部集成程序调用，
|   └── 📃 app.go              如果是单体架构，被聚合到整个程序的总入口；如果是微服务，会被单独打包成服务
├── 📁 domain                 // 领域对象，包括实体、值对象、聚合等对象
|   ├── 📃 entity.go               // 具体实体，用来描述全生命周期的业务对象
|   ├── 📃 value_object.go         // 具体值对象，用来描述实体中的属性约束
|   ├── 📃 aggregate_root.go       // 具体聚合根，用来描述有多个实体聚合成的复杂业务结构
|   └── 📃 interfaces.go           // 存储库接口，用来描述实体的持久化设计
├── 📁 events                 // 领域事件 
├── 📁 infra                  // 基础设施适配器，用来连接基础设施中的功能
|   |── 📁 mysql                  // 具体连接数据库实现
|   └── 📁 grpc                   // 具体实现gRPC Server接口，或者gRPC Stub调用
└── 📁 usecases               // 用例层
    |── 📃 interface.go           // 依赖倒置
    └── 📃 services.go            // 领域服务，具体用例的实现


```

---

# 领域对象的由来
从 SMART UI 到领域驱动设计的复杂行为建模

<br>
<img src="/ddd-diagram.png" class="w-[600px] mx-auto mt--5" />


---

# 实体/Entity
一个具有唯一标识的模型，使用值对象验证属性规则

<div class="w-[50%] float-right ml-2">
  <ul>
    <li>全生命周期合法性，拒绝半成品实体</li>
    <li>使用工厂方法或者抽象工厂创建实体</li>
  </ul>
  <br>
  <img src="/entity-lifecycle.svg" class="w-[100%]" />
</div>



```go
type User struct {
	name    Username
	email   Email
	active  boolean
  }
  
func NewUser (nameStr string, emailStr string, 
active bool) *User, error{
	name, err := NewUsername(nameStr)
	if err!={
		return nil, errors.Wrap(err, "User.NewUser")
	}
	email, err := NewEmail(emailStr)
	if err!={
		return nil, errors.Wrap(err, "User.NewUser")
	}
	return &User{
		name:   name,
		email:  email,
		active: active
	}
}

```

---

# 技术篇(框架和驱动层)

<img src="/explicit-architecture-adopter.png" class="h-[80%] mx-auto" />

---

# Protocol Buffers 与 gRPC
gRPC Server


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

# gRPC Server 开发
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

# gRPC Adopter
在领域中适配gRPC Server的模块

<br>

1. **实现接口** - gen.XXXServiceServer接口，也就是protobu中，service定义生成的接口
2. **注册服务**，使用 gen.RegisterXXXServiceServer 注册到grpcServer
3. **调用领域功能**，通过调用usecases来实现对功能的调用
4. **转化数据**， 将领域对象转化为gen中的DTO

<br>
<br>

### 小贴士

- 对于List数据转化时，可以使用 `github.com/samber/lo` 包，实现`Lodash-style`的转化，类似Java8中的stream

---




# ORM Adopter
根据SQL语句，自动生成类型安全的数据库实现代码

- 安装`github.com/kyleconroy/sqlc`
- 书写SQL语句
- 生成代码，包括带有类型的DTO对象，接口和数据库实现代码

