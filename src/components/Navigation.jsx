import { useRef, useState } from 'react'
import Link from 'next/link'
import { Router, useRouter } from 'next/router'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

// import { Button } from '@/components/Button'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'

function useInitialValue(value, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({ href, children }) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function NavLink({ href, tag, active, isAnchorLink = false, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({ group, pathname }) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation()
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0]
    )
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({ group, pathname }) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-yellow-600"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({ group, className }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [router, sections] = useInitialValue(
    [useRouter(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation
  )
  let isActiveGroup =
    group.links.findIndex((link) => link.href === router.pathname) !== -1
  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-sm font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link, linkIndex) => (
            <motion.li key={linkIndex} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === router.pathname}>
                {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === router.pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section, sectionIndex) => (
                      <li key={sectionIndex + 1}>
                        <NavLink
                          href={`${link.href}#${sectionIndex + 1}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

const NavigationObj = {
  quickStart: [
    {
      title: '快速入门',
      links: [
        { title: '安装终端', href: '/' },
        { title: '数据', href: '/data' },
        { title: '投研', href: '/strategy' },
        { title: '实盘交易', href: '/trading' },
      ],
    },
  ],
  operatingInstruction: [
    {
      title: '量化研究',
      links: [
        { title: '示例策略', href: '/operatingInstruction/study' },
        {
          title: '策略编写',
          href: '/operatingInstruction/study/strategyWrite',
        },
        {
          title: '策略回测与绩效',
          href: '/operatingInstruction/study/backtest',
        },
        {
          title: 'SDK下载及说明文档',
          href: '/operatingInstruction/study/sdk',
        },
      ],
    },
    {
      title: '量化交易',
      links: [
        { title: '仿真交易', href: '/operatingInstruction/trading' },
        { title: '实盘交易', href: '/operatingInstruction/trading/real' },
        { title: '策略功能', href: '/operatingInstruction/trading/function' },
        { title: '策略设置', href: '/operatingInstruction/trading/setting' },
      ],
    },
    {
      title: '智能策略',
      links: [{ title: '智能策略', href: '/operatingInstruction/strategy' }],
    },
    {
      title: '交易工具',
      links: [{ title: '交易工具', href: '/operatingInstruction/tools' }],
    },
    {
      title: '账户管理',
      links: [{ title: '账户管理', href: '/operatingInstruction/management' }],
    },
    {
      title: '系统设置',
      links: [{ title: '系统设置', href: '/operatingInstruction/setting' }],
    },
  ],
  sdks: [
    {
      title: 'Python SDK',
      links: [
        { title: '快速开始', href: '/sdks/python' },
        { title: '策略程序架构', href: '/sdks/python/frame' },
        // { title: 'SDK', href: '/sdks/python/sdk' },
        { title: '变量约定', href: '/sdks/python/convention' },
        { title: '数据结构', href: '/sdks/python/structrue' },
        { title: 'API介绍', href: '/sdks/python/api' },
        { title: '枚举常量', href: '/sdks/python/enum' },
        { title: '错误码', href: '/sdks/python/code' },
      ],
    },
    {
      title: 'C++ SDK',
      links: [
        { title: '快速开始', href: '/sdks/cpp' },
        { title: '重要概念', href: '/sdks/cpp/concept' },
        { title: '策略基类', href: '/sdks/cpp/baseClass' },
        { title: '数据查询函数', href: '/sdks/cpp/query' },
        { title: '结果集合类', href: '/sdks/cpp/resSet' },
        { title: '结果数组类', href: '/sdks/cpp/resArray' },
        { title: '数据结构', href: '/sdks/cpp/structure' },
        { title: '枚举常量', href: '/sdks/cpp/enum' },
        { title: '错误码', href: '/sdks/cpp/code' },
      ],
    },
    {
      title: 'C# SDK',
      links: [
        { title: '快速开始', href: '/sdks/cSharp' },
        { title: '重要概念', href: '/sdks/cSharp/concept' },
        { title: '策略基类', href: '/sdks/cSharp/baseClass' },
        { title: '数据查询函数', href: '/sdks/cSharp/query' },
        { title: '结果集合类', href: '/sdks/cSharp/resSet' },
        { title: '数据结构', href: '/sdks/cSharp/structure' },
        { title: '枚举常量', href: '/sdks/cSharp/enum' },
        { title: '错误码', href: '/sdks/cSharp/code' },
      ],
    },
    {
      title: 'MATLAB SDK',
      links: [{ title: '快速开始', href: '/sdks/matlab' }],
    },
  ],
  docs: [
    {
      title: '数据文档',
      links: [
        { title: '股票', href: '/docs' },
        { title: '期货', href: '/docs/futures' },
        { title: '可转债', href: '/docs/convertible' },
        { title: '指数', href: '/docs/exponent' },
      ],
    },
  ],
  faq: [
    {
      title: '常见问题',
      links: [
        { title: '终端问题', href: '/faq' },
        { title: '数据问题', href: '/faq/data' },
        { title: '实盘问题', href: '/faq/real' },
        { title: '产品问题', href: '/faq/product' },
      ],
    },
  ],
  tool: [
    {
      title: '量化工具',
      links: [
        { title: '量化工具', href: '/tool' },
        { title: '文件单', href: '/tool/file' },
      ],
    },
  ],
  other: [
    {
      title: '其他',
      links: [
        { title: 'SDK下载', href: '/other' },
        { title: 'Markdown语法快速入门', href: '/other/markdown' },
        { title: '终端升级日志', href: '/other/log' },
      ],
    },
  ],
}

export let navigation = []

// export function setNavigation(arr) {
//   navigation = [...arr]
// }
import { useEffect } from 'react'
export function Navigation(props) {
  let router = useRouter()
  // let navigation = []
  const [navigationMenu, setNavigationMenu] = useState()

  function onRouteChange() {
    if (NavigationObj[router.pathname.split('/')[1]]) {
      setNavigationMenu([...NavigationObj[router.pathname.split('/')[1]]])
    } else {
      setNavigationMenu([...NavigationObj['quickStart']])
    }
  }

  // useEffect(() => {
  //   onRouteChange()
  //   console.log(navigationMenu)
  // }, [])

  if (!navigationMenu) {
    onRouteChange()
  }
  Router.events.on('routeChangeComplete', onRouteChange)
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="/">快速入门</TopLevelNavItem>
        <TopLevelNavItem href="/operatingInstruction/strategy">
          操作指引
        </TopLevelNavItem>
        <TopLevelNavItem href="/sdks/python">SDKs</TopLevelNavItem>
        <TopLevelNavItem href="/docs">数据文档</TopLevelNavItem>
        <TopLevelNavItem href="/faq">常见问题</TopLevelNavItem>
        <TopLevelNavItem href="/tool">量化工具</TopLevelNavItem>
        <TopLevelNavItem href="/other">其他</TopLevelNavItem>
        {navigationMenu && navigationMenu.length > 0
          ? navigationMenu.map((group, groupIndex) => (
              <NavigationGroup
                key={group.title}
                group={group}
                className={groupIndex === 0 && 'md:mt-0'}
              />
            ))
          : ''}
        {/* <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button href="#" variant="filled" className="w-full">
            Sign in
          </Button>
        </li> */}
      </ul>
    </nav>
  )
}
