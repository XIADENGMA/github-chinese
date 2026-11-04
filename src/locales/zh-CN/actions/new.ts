import type { PageDictionary } from '../../../core/types'

/**
 * 新建工作流（/actions/new）：入门引导、模板类别、常用起始模板说明、文档卡片。
 * 模板的 category 按官方正文作“类别”（“安全性”类别、按类别筛选），“分类”留给 triage。
 * 产品名按 product-names.md 译出：GitHub Actions → GitHub 操作，GitHub Packages → GitHub 软件包，GitHub Pages → GitHub 页面。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 模板作者中的产品名（By GitHub Actions）；其余作者名是第三方名称，保留原文 */
const AUTHORS: Readonly<Record<string, string>> = { 'GitHub Actions': 'GitHub 操作' }

export default {
  static: {
    'Get started with GitHub Actions': '开始使用 GitHub 操作',
    'Choose a workflow': '选择工作流',
    'Build, test, and deploy your code. Make code reviews, branch management, and issue triaging work the way you want. Select a workflow to get started.':
      '构建、测试和部署代码。按你的方式处理代码审查、分支管理和议题分类。选择一个工作流开始。',
    'Skip this and': '跳过此步骤并',
    'set up a workflow yourself': '自行设置工作流',
    'Set up a workflow yourself': '自行设置工作流',
    'Suggested for this repository': '为此存储库推荐',
    'Continuous integration': '持续集成',
    'Browse all categories': '浏览所有类别',
    'Create new workflow': '新建工作流',
    'Start with a file with the minimum necessary structure.': '从包含最基本结构的文件开始。',
    'Simple workflow': '简单工作流',
    'Manual workflow': '手动工作流',
    'Simple workflow that is manually triggered.': '手动触发的简单工作流。',
    'Getting started and core concepts': '入门和核心概念',
    'New to Actions? Start here. Learn the core concepts and how to get started.': '初次使用操作？从这里开始。了解核心概念和入门方法。',
    'Configuring and managing workflows': '配置和管理工作流',
    'Create custom workflows to control your project’s life cycle processes.': '创建自定义工作流来控制项目的生命周期流程。',
    "Create custom workflows to control your project's life cycle processes.": '创建自定义工作流来控制项目的生命周期流程。',
    'Language and framework guides': '语言和框架指南',
    'Guides for projects written in many programming languages.': '适用于多种编程语言项目的指南。',
    'Didn’t find what you’re looking for?': '没有找到所需内容？',
    "Didn't find what you're looking for?": '没有找到所需内容？',
    'Fill out a 2-minute survey to request a new workflow template for GitHub Actions.':
      '填写 2 分钟问卷以申请新的 GitHub 操作工作流模板。',
    'GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD. Build, test, and deploy your code right from GitHub.':
      '借助 GitHub 操作轻松自动化所有软件工作流，现已提供一流的 CI/CD。直接在 GitHub 中构建、测试和部署代码。',
    'Learn more about getting started with Actions.': '了解如何开始使用操作。',

    // 常用起始模板说明
    'Build a Node.js project and deploy it to an Azure Web App.': '构建 Node.js 项目并部署到 Azure Web App。',
    'Deploy a container to an Amazon ECS service powered by AWS Fargate or Amazon EC2.':
      '将容器部署到由 AWS Fargate 或 Amazon EC2 驱动的 Amazon ECS 服务。',
    'Build a docker container, publish it to Google Container Registry, and deploy to GKE.':
      '构建 Docker 容器，发布到 Google Container Registry，并部署到 GKE。',
    'Set up Terraform CLI in your GitHub Actions workflow.': '在 GitHub 操作工作流中设置 Terraform CLI。',
    'Deploy a container to Alibaba Cloud Container Service for Kubernetes (ACK).': '将容器部署到阿里云容器服务 Kubernetes 版 (ACK)。',
    'Build a docker container, publish it to IBM Cloud Container Registry, and deploy to IBM Cloud Kubernetes Service.':
      '构建 Docker 容器，发布到 IBM Cloud Container Registry，并部署到 IBM Cloud Kubernetes Service。',
    'This workflow will build a docker container, publish and deploy it to Tencent Kubernetes Engine (TKE).':
      '此工作流将构建 Docker 容器，并发布和部署到腾讯云容器服务 (TKE)。',
    'Build a Docker-based project and deploy it to OpenShift.': '构建基于 Docker 的项目并部署到 OpenShift。',
    'Security analysis from GitHub for C, C++, C#, Go, Java, JavaScript, TypeScript, Python, Ruby, Kotlin and Swift developers.':
      'GitHub 为 C、C++、C#、Go、Java、JavaScript、TypeScript、Python、Ruby、Kotlin 和 Swift 开发人员提供的安全分析。',
    'Test a Laravel project.': '测试 Laravel 项目。',
    'Test a Symfony project.': '测试 Symfony 项目。',
    'Build a Java Package using Gradle and publish to GitHub Packages.': '使用 Gradle 构建 Java 软件包并发布到 GitHub 软件包。',
    'Create and test an R package on multiple R versions.': '在多个 R 版本上创建并测试 R 软件包。',
    'Greets users who are first time contributors to the repo': '向首次为存储库做贡献的用户致意',
    'Labels pull requests based on the files changed': '根据已更改的文件为拉取请求添加标签',
    'Summarizes new issues': '总结新议题',
    'Package a Jekyll site with GitHub Pages dependencies preinstalled.': '打包预装 GitHub 页面依赖项的 Jekyll 站点。',
    'Package a Next.js site.': '打包 Next.js 站点。',
    'Package a Jekyll site.': '打包 Jekyll 站点。',
    'Package a Gatsby site.': '打包 Gatsby 站点。',
    'Package a NuxtJS site.': '打包 NuxtJS 站点。',
    'Package a site using mdBook.': '使用 mdBook 打包站点。',
    'Deploy an Astro site.': '部署 Astro 站点。',
    'Publishes a Node.js package to GitHub Packages.': '将 Node.js 软件包发布到 GitHub 软件包。',
    'Build and test a Crystal project.': '构建并测试 Crystal 项目。',
    'Run linters for several languages on your code base for changed files': '对代码库中已更改的文件运行多种语言的 Linter',
    'Checks for stale issues and pull requests': '检查陈旧的议题和拉取请求',
    'Build and test a Node.js project with npm.': '使用 npm 构建并测试 Node.js 项目。',
    'Create and test a Python application.': '创建并测试 Python 应用。',
    'Create and test a Python package on multiple Python versions.': '在多个 Python 版本上创建并测试 Python 软件包。',
    'Build a Go project.': '构建 Go 项目。',
    'Build a Docker image to deploy, run, or push to a registry.': '构建 Docker 映像以部署、运行或推送到注册表。',
    'Build and test a Rust project with Cargo.': '使用 Cargo 构建并测试 Rust 项目。',
    'Build and test a Java project with Apache Maven.': '使用 Apache Maven 构建并测试 Java 项目。',
    'Build and test a .NET or ASP.NET Core project.': '构建并测试 .NET 或 ASP.NET Core 项目。',

    // 第三方起始模板说明
    'PMD is a static source code analyzer. It supports Java, JavaScript, Apex and Visualforce, Modelica, PLSQL, Apache Velocity, XML, XSL, Scala.':
      'PMD 是静态源代码分析器。支持 Java、JavaScript、Apex 和 Visualforce、Modelica、PLSQL、Apache Velocity、XML、XSL、Scala。',
    'Scans any target, whether Web Apps, APIs (REST. & SOAP, GraphQL & more), Web sockets or mobile, providing actionable reports':
      '扫描任意目标，包括 Web 应用、API（REST 和 SOAP、GraphQL 等）、WebSocket 或移动应用，并提供可操作的报告',
    'Security risk analysis for Kubernetes resources. Submit pod-types (such as deployment, cronjob) to receive an itemised security risk score.':
      'Kubernetes 资源的安全风险分析。提交 Pod 类型（如 deployment、cronjob）以获取逐项安全风险评分。',
    'SOOS DAST is the easy-to-integrate no-limit web vulnerability scanner. Integrate SOOS DAST with your CI pipeline to find vulnerabilities by scanning a web app or APIs.':
      'SOOS DAST 是易于集成且不设限制的 Web 漏洞扫描器。将 SOOS DAST 集成到 CI 流水线以通过扫描 Web 应用或 API 发现漏洞。',
    'APIsec provides the industry’s only automated and continuous API testing platform that uncovers security vulnerabilities and logic flaws in APIs.':
      'APIsec 提供业界唯一可发现 API 中安全漏洞和逻辑缺陷的自动化持续 API 测试平台。',
    'Static analysis of code for vulnerability detection, covering 26+ languages. Start cleaning your code in minutes!':
      '通过静态代码分析检测漏洞，覆盖 26 种以上语言。几分钟内即可开始清理代码！',

    // GitHub 操作功能介绍
    'Linux, macOS, Windows, ARM, and containers': 'Linux、macOS、Windows、ARM 和容器',
    'Hosted runners for every major OS make it easy to build and test all your projects. Run directly on a VM or inside a container. Use your own VMs, in the cloud or on-prem, with self-hosted runners.':
      '覆盖所有主流操作系统的托管运行器可轻松构建和测试所有项目。可直接在虚拟机或容器中运行。也可以通过自托管运行器使用你自己的虚拟机，无论在云端还是本地。',
    'Matrix builds': '矩阵构建',
    'Save time with matrix workflows that simultaneously test across multiple operating systems and versions of your runtime.':
      '使用可同时在多个操作系统和运行时版本上测试的矩阵工作流节省时间。',
    'GitHub Actions supports Node.js, Python, Java, Ruby, PHP, Go, Rust, .NET, and more. Build, test, and deploy applications in your language of choice.':
      'GitHub 操作支持 Node.js、Python、Java、Ruby、PHP、Go、Rust、.NET 等。使用你选择的语言构建、测试和部署应用。',
    'Live logs': '实时日志',
    'See your workflow run in realtime with color and emoji. It’s one click to copy a link that highlights a specific line number to share a CI/CD failure.':
      '实时查看带颜色和表情符号的工作流运行。一键复制高亮指定行号的链接即可分享 CI/CD 失败。',
    'Built-in secret store': '内置机密存储',
    'Automate your software development practices with workflow files embracing the Git flow by codifying it in your repository.':
      '用工作流文件将 Git 流程写入存储库以自动化软件开发实践。',
    'Multi-container testing': '多容器测试'
  },

  scoped: {
    // Test your web service … by simply adding some <code>docker-compose</code> to your workflow file.
    'Test your web service and its DB in your workflow by simply adding some': '只需在工作流文件中添加一些',
    'to your workflow file.': '即可在工作流中测试 Web 服务及其数据库。',
    Categories: '类别',
    // 模板类别名（Deployment 在 workflows.ts）；Pages 按 product-names.md 作“页面”，与“页面工作流”一致
    Automation: '自动化',
    'Code scanning': '代码扫描',
    Pages: '页面',
    Request: '申请',
    'deployment workflows': '部署工作流',
    'security workflows': '安全工作流',
    'continuous integration workflows': '持续集成工作流',
    'automation workflows': '自动化工作流',
    'code scanning workflows': '代码扫描工作流',
    'Pages workflows': '页面工作流'
  },

  regexp: [
    [/^Found ([\d,]+) workflows?$/, '找到 $1 个工作流'],
    // 模板作者：By GitHub Actions、By Microsoft Azure
    [/^By (.+)$/, (_, author: string) => `来自 ${pick(AUTHORS, author) ?? author}`]
  ]
} satisfies PageDictionary
