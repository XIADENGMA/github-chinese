import type { PageDictionary } from '../../../core/types'

/**
 * 新建工作流（/actions/new）：入门引导、模板类别、常用起始模板说明、文档卡片。
 * 模板的 category 作「類別」（「安全性」類別、依類別篩選），「分類」留给 triage。
 * 产品名按术语表第 3 节译出：GitHub Actions → GitHub 動作，GitHub Packages → GitHub 套件，GitHub Pages → GitHub 頁面。
 * 第三方产品名（Alibaba Cloud Container Service for Kubernetes、Tencent Kubernetes Engine 等）保留原文。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 模板作者中的产品名（By GitHub Actions）；其余作者名是第三方名称，保留原文 */
const AUTHORS: Readonly<Record<string, string>> = { 'GitHub Actions': 'GitHub 動作' }

export default {
  static: {
    'Get started with GitHub Actions': '開始使用 GitHub 動作',
    'Choose a workflow': '選擇工作流程',
    'Build, test, and deploy your code. Make code reviews, branch management, and issue triaging work the way you want. Select a workflow to get started.':
      '建置、測試並部署程式碼。以你想要的方式處理程式碼審查、分支管理和議題分類。選擇工作流程以開始使用。',
    'Skip this and': '略過此步驟並',
    'set up a workflow yourself': '自行設定工作流程',
    'Set up a workflow yourself': '自行設定工作流程',
    'Suggested for this repository': '為此儲存庫推薦',
    'Continuous integration': '持續整合',
    'Browse all categories': '瀏覽所有類別',
    'Create new workflow': '建立新工作流程',
    'Start with a file with the minimum necessary structure.': '從具備最基本結構的檔案開始。',
    'Simple workflow': '簡單工作流程',
    'Manual workflow': '手動工作流程',
    'Simple workflow that is manually triggered.': '手動觸發的簡單工作流程。',
    'Getting started and core concepts': '入門和核心概念',
    'New to Actions? Start here. Learn the core concepts and how to get started.': '初次使用動作？從這裡開始。瞭解核心概念和入門方法。',
    'Configuring and managing workflows': '設定並管理工作流程',
    'Create custom workflows to control your project’s life cycle processes.': '建立自訂工作流程來控制專案的生命週期流程。',
    "Create custom workflows to control your project's life cycle processes.": '建立自訂工作流程來控制專案的生命週期流程。',
    'Language and framework guides': '語言和框架指南',
    'Guides for projects written in many programming languages.': '適用於多種程式語言專案的指南。',
    'Didn’t find what you’re looking for?': '找不到你要的內容嗎？',
    "Didn't find what you're looking for?": '找不到你要的內容嗎？',
    'Fill out a 2-minute survey to request a new workflow template for GitHub Actions.':
      '填寫 2 分鐘問卷，提出新的 GitHub 動作工作流程範本需求。',
    'GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD. Build, test, and deploy your code right from GitHub.':
      'GitHub 動作讓所有軟體工作流程輕鬆自動化，現已提供世界級的 CI/CD。直接在 GitHub 上建置、測試並部署程式碼。',
    'Learn more about getting started with Actions.': '瞭解如何開始使用動作。',

    // 常用起始模板说明
    'Build a Node.js project and deploy it to an Azure Web App.': '建置 Node.js 專案並部署到 Azure Web App。',
    'Deploy a container to an Amazon ECS service powered by AWS Fargate or Amazon EC2.':
      '將容器部署到採用 AWS Fargate 或 Amazon EC2 的 Amazon ECS 服務。',
    'Build a docker container, publish it to Google Container Registry, and deploy to GKE.':
      '建置 Docker 容器，發布到 Google Container Registry，並部署到 GKE。',
    'Set up Terraform CLI in your GitHub Actions workflow.': '在 GitHub 動作工作流程中設定 Terraform CLI。',
    'Deploy a container to Alibaba Cloud Container Service for Kubernetes (ACK).':
      '將容器部署到 Alibaba Cloud Container Service for Kubernetes (ACK)。',
    'Build a docker container, publish it to IBM Cloud Container Registry, and deploy to IBM Cloud Kubernetes Service.':
      '建置 Docker 容器，發布到 IBM Cloud Container Registry，並部署到 IBM Cloud Kubernetes Service。',
    'This workflow will build a docker container, publish and deploy it to Tencent Kubernetes Engine (TKE).':
      '此工作流程會建置 Docker 容器，發布並部署到 Tencent Kubernetes Engine (TKE)。',
    'Build a Docker-based project and deploy it to OpenShift.': '建置以 Docker 為基礎的專案並部署到 OpenShift。',
    'Security analysis from GitHub for C, C++, C#, Go, Java, JavaScript, TypeScript, Python, Ruby, Kotlin and Swift developers.':
      'GitHub 為 C、C++、C#、Go、Java、JavaScript、TypeScript、Python、Ruby、Kotlin 和 Swift 開發人員提供的安全性分析。',
    'Test a Laravel project.': '測試 Laravel 專案。',
    'Test a Symfony project.': '測試 Symfony 專案。',
    'Build a Java Package using Gradle and publish to GitHub Packages.': '使用 Gradle 建置 Java 套件並發布到 GitHub 套件。',
    'Create and test an R package on multiple R versions.': '在多個 R 版本上建立並測試 R 套件。',
    'Greets users who are first time contributors to the repo': '問候儲存庫的首次貢獻者',
    'Labels pull requests based on the files changed': '根據變更的檔案為拉取請求加上標籤',
    'Summarizes new issues': '為新議題產生摘要',
    'Package a Jekyll site with GitHub Pages dependencies preinstalled.': '打包預先安裝 GitHub 頁面相依項目的 Jekyll 網站。',
    'Package a Next.js site.': '打包 Next.js 網站。',
    'Package a Jekyll site.': '打包 Jekyll 網站。',
    'Package a Gatsby site.': '打包 Gatsby 網站。',
    'Package a NuxtJS site.': '打包 NuxtJS 網站。',
    'Package a site using mdBook.': '使用 mdBook 打包網站。',
    'Deploy an Astro site.': '部署 Astro 網站。',
    'Publishes a Node.js package to GitHub Packages.': '將 Node.js 套件發布到 GitHub 套件。',
    'Build and test a Crystal project.': '建置並測試 Crystal 專案。',
    'Run linters for several languages on your code base for changed files': '對程式碼基底中變更的檔案執行多種語言的 Linter',
    'Checks for stale issues and pull requests': '檢查過時的議題和拉取請求',
    'Build and test a Node.js project with npm.': '使用 npm 建置並測試 Node.js 專案。',
    'Create and test a Python application.': '建立並測試 Python 應用程式。',
    'Create and test a Python package on multiple Python versions.': '在多個 Python 版本上建立並測試 Python 套件。',
    'Build a Go project.': '建置 Go 專案。',
    'Build a Docker image to deploy, run, or push to a registry.': '建置 Docker 映像檔以部署、執行或推送到登錄庫。',
    'Build and test a Rust project with Cargo.': '使用 Cargo 建置並測試 Rust 專案。',
    'Build and test a Java project with Apache Maven.': '使用 Apache Maven 建置並測試 Java 專案。',
    'Build and test a .NET or ASP.NET Core project.': '建置並測試 .NET 或 ASP.NET Core 專案。',

    // 第三方起始模板说明
    'PMD is a static source code analyzer. It supports Java, JavaScript, Apex and Visualforce, Modelica, PLSQL, Apache Velocity, XML, XSL, Scala.':
      'PMD 是靜態原始碼分析器。支援 Java、JavaScript、Apex 和 Visualforce、Modelica、PLSQL、Apache Velocity、XML、XSL、Scala。',
    'Scans any target, whether Web Apps, APIs (REST. & SOAP, GraphQL & more), Web sockets or mobile, providing actionable reports':
      '掃描任何目標，包括 Web 應用程式、API（REST 和 SOAP、GraphQL 等）、WebSocket 或行動應用程式，並提供可採取行動的報告',
    'Security risk analysis for Kubernetes resources. Submit pod-types (such as deployment, cronjob) to receive an itemised security risk score.':
      'Kubernetes 資源的安全性風險分析。送出 Pod 類型（例如 deployment、cronjob）以取得逐項的安全性風險評分。',
    'SOOS DAST is the easy-to-integrate no-limit web vulnerability scanner. Integrate SOOS DAST with your CI pipeline to find vulnerabilities by scanning a web app or APIs.':
      'SOOS DAST 是易於整合且不設限制的 Web 漏洞掃描器。將 SOOS DAST 整合到 CI 管線，掃描 Web 應用程式或 API 以找出漏洞。',
    'APIsec provides the industry’s only automated and continuous API testing platform that uncovers security vulnerabilities and logic flaws in APIs.':
      'APIsec 提供業界唯一能找出 API 中安全性漏洞和邏輯缺陷的自動化持續 API 測試平台。',
    'Static analysis of code for vulnerability detection, covering 26+ languages. Start cleaning your code in minutes!':
      '以靜態程式碼分析偵測漏洞，涵蓋 26 種以上語言。幾分鐘內就能開始清理程式碼！',

    // GitHub 動作功能介绍
    'Linux, macOS, Windows, ARM, and containers': 'Linux、macOS、Windows、ARM 和容器',
    'Hosted runners for every major OS make it easy to build and test all your projects. Run directly on a VM or inside a container. Use your own VMs, in the cloud or on-prem, with self-hosted runners.':
      '適用各主要作業系統的代管執行器讓你輕鬆建置並測試所有專案。可直接在虛擬機器上或容器內執行。也能透過自架執行器使用你自己的虛擬機器，無論是在雲端還是內部部署環境。',
    'Matrix builds': '矩陣建置',
    'Save time with matrix workflows that simultaneously test across multiple operating systems and versions of your runtime.':
      '使用可同時在多個作業系統和執行階段版本上測試的矩陣工作流程來節省時間。',
    'GitHub Actions supports Node.js, Python, Java, Ruby, PHP, Go, Rust, .NET, and more. Build, test, and deploy applications in your language of choice.':
      'GitHub 動作支援 Node.js、Python、Java、Ruby、PHP、Go、Rust、.NET 等。使用你選擇的語言建置、測試並部署應用程式。',
    'Live logs': '即時記錄',
    'See your workflow run in realtime with color and emoji. It’s one click to copy a link that highlights a specific line number to share a CI/CD failure.':
      '以彩色和表情符號即時查看工作流程執行。只要按一下就能複製醒目提示特定行號的連結以分享 CI/CD 失敗。',
    'Built-in secret store': '內建機密存放區',
    'Automate your software development practices with workflow files embracing the Git flow by codifying it in your repository.':
      '使用將 Git 流程寫入儲存庫的工作流程檔案自動化軟體開發實務。',
    'Multi-container testing': '多容器測試'
  },

  scoped: {
    // Test your web service … by simply adding some <code>docker-compose</code> to your workflow file.
    // 只要在工作流程檔案中加入一些 docker-compose 就能在工作流程中測試 Web 服務和資料庫。
    'Test your web service and its DB in your workflow by simply adding some': '只要在工作流程檔案中加入一些',
    'to your workflow file.': '就能在工作流程中測試 Web 服務和資料庫。',
    Categories: '類別',
    // 模板类别名（Deployment 在 workflows.ts）；Pages 按术语表作「頁面」，与「頁面工作流程」一致
    Automation: '自動化',
    'Code scanning': '程式碼掃描',
    Pages: '頁面',
    Request: '提出需求',
    'deployment workflows': '部署工作流程',
    'security workflows': '安全性工作流程',
    'continuous integration workflows': '持續整合工作流程',
    'automation workflows': '自動化工作流程',
    'code scanning workflows': '程式碼掃描工作流程',
    'Pages workflows': '頁面工作流程'
  },

  regexp: [
    [/^Found ([\d,]+) workflows?$/, '找到 $1 個工作流程'],
    // 模板作者：By GitHub Actions、By Microsoft Azure
    [/^By (.+)$/, (_, author: string) => `來自 ${pick(AUTHORS, author) ?? author}`]
  ]
} satisfies PageDictionary
