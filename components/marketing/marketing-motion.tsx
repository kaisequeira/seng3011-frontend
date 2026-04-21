"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function MarketingMotion() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const header = document.querySelector("[data-marketing-header]")
      if (header) {
        gsap.fromTo(
          header,
          { y: -24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "power2.out" }
        )

        ScrollTrigger.create({
          trigger: document.body,
          start: "top top",
          end: 240,
          scrub: true,
          onUpdate: (self) => {
            gsap.to(header, {
              scale: 1 - self.progress * 0.025,
              duration: 0.2,
              overwrite: true,
            })
          },
        })
      }

      const heroCopy = document.querySelector("[data-hero-copy]")
      const heroActions = document.querySelector("[data-hero-actions]")
      const heroBrowser = document.querySelector("[data-hero-browser]")

      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } })
      if (heroCopy)
        heroTimeline.fromTo(
          heroCopy,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 }
        )
      if (heroActions)
        heroTimeline.fromTo(
          heroActions,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.45"
        )
      if (heroBrowser) {
        heroTimeline.fromTo(
          heroBrowser,
          { y: 112, opacity: 0, rotateX: 8 },
          { y: 54, opacity: 1, rotateX: 0, duration: 1.05 },
          "-=0.45"
        )

        gsap.fromTo(
          heroBrowser,
          { y: 54 },
          {
            y: -8,
            ease: "none",
            immediateRender: false,
            overwrite: "auto",
            scrollTrigger: {
              trigger: heroBrowser,
              start: "top 92%",
              end: "top 24%",
              scrub: true,
            },
          }
        )
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              once: true,
            },
          }
        )
      })

      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
          }
        )
      })

      const pipeline = document.querySelector("[data-pipeline]")
      if (pipeline) {
        const steps = pipeline.querySelectorAll("[data-pipeline-step]")
        gsap.fromTo(
          steps,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pipeline,
              start: "top 80%",
              once: true,
            },
          }
        )
      }

      const pipelineOutput = document.querySelector("[data-pipeline-output]")
      if (pipelineOutput) {
        gsap.fromTo(
          pipelineOutput,
          { y: 24, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pipelineOutput,
              start: "top 82%",
              once: true,
            },
          }
        )

        const percentage = pipelineOutput.querySelector<HTMLElement>(
          "[data-risk-percentage]"
        )
        const fill =
          pipelineOutput.querySelector<HTMLElement>("[data-risk-fill]")
        const level =
          pipelineOutput.querySelector<HTMLElement>("[data-risk-level]")

        if (percentage && fill && level) {
          const values = [23.4, 41.8, 16.2, 35.7]
          const state = { value: values[0] }

          const updateRiskUi = () => {
            percentage.textContent = `${state.value.toFixed(1)}%`
            fill.style.width = `${state.value}%`

            if (state.value >= 40) {
              level.textContent = "High"
              level.className =
                "rounded-full bg-rose-400/20 px-3 py-1 text-xs font-medium text-rose-200"
            } else if (state.value >= 25) {
              level.textContent = "Elevated"
              level.className =
                "rounded-full bg-amber-400/20 px-3 py-1 text-xs font-medium text-amber-200"
            } else {
              level.textContent = "Low"
              level.className =
                "rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-200"
            }
          }

          updateRiskUi()

          const riskTimeline = gsap.timeline({
            repeat: -1,
            repeatDelay: 0.25,
            defaults: {
              duration: 1.35,
              ease: "sine.inOut",
              onUpdate: updateRiskUi,
            },
          })

          values.slice(1).forEach((value) => {
            riskTimeline.to({}, { duration: 2, ease: "none" })
            riskTimeline.to(state, { value })
          })

          riskTimeline.to({}, { duration: 2, ease: "none" })
          riskTimeline.to(state, { value: values[0] })
        }
      }

      const trustVisual = document.querySelector("[data-trust-visual]")
      if (trustVisual) {
        gsap.fromTo(
          trustVisual,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: trustVisual,
              start: "top 82%",
              once: true,
            },
          }
        )

        const apiNode = trustVisual.querySelector<HTMLElement>(
          "[data-trust-node='api']"
        )
        const idpNode = trustVisual.querySelector<HTMLElement>(
          "[data-trust-node='idp']"
        )
        const obsNode = trustVisual.querySelector<HTMLElement>(
          "[data-trust-node='obs']"
        )

        const positionOrbitNode = (
          node: HTMLElement,
          angle: number,
          radius: number
        ) => {
          const visualRect = trustVisual.getBoundingClientRect()
          const centerX = visualRect.width / 2
          const centerY = visualRect.height / 2
          const radians = (angle * Math.PI) / 180
          const x = centerX + Math.cos(radians) * radius - node.offsetWidth / 2
          const y = centerY + Math.sin(radians) * radius - node.offsetHeight / 2
          gsap.set(node, { xPercent: 0, yPercent: 0, x, y })
        }

        if (apiNode && idpNode && obsNode) {
          const orbitState = { angle: -130 }

          const updateOrbit = () => {
            const outerRadius = trustVisual.clientWidth * 0.36
            const innerRadius = trustVisual.clientWidth * 0.24
            positionOrbitNode(apiNode, orbitState.angle, outerRadius)
            positionOrbitNode(idpNode, orbitState.angle + 120, outerRadius)
            positionOrbitNode(obsNode, orbitState.angle + 255, innerRadius)
          }

          updateOrbit()

          gsap.to(orbitState, {
            angle: orbitState.angle + 360,
            duration: 18,
            ease: "none",
            repeat: -1,
            onUpdate: updateOrbit,
          })
        }
      }

      const footer = document.querySelector("footer")
      if (footer) {
        gsap.fromTo(
          footer,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footer,
              start: "top 92%",
              once: true,
            },
          }
        )
      }

      const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>("[data-scroll-link]")
      )
      const listeners: Array<() => void> = []

      links.forEach((link) => {
        const handler = (event: Event) => {
          const href = link.getAttribute("href")
          if (!href?.startsWith("#")) return

          const target = document.querySelector<HTMLElement>(href)
          if (!target) return

          event.preventDefault()

          const targetY =
            target.getBoundingClientRect().top + window.scrollY - 88
          const tweenState = { y: window.scrollY }

          gsap.to(tweenState, {
            y: targetY,
            duration: 0.95,
            ease: "power3.inOut",
            overwrite: true,
            onUpdate: () => {
              window.scrollTo({ top: tweenState.y })
            },
          })
        }

        link.addEventListener("click", handler)
        listeners.push(() => link.removeEventListener("click", handler))
      })

      const topLinks = Array.from(
        document.querySelectorAll<HTMLAnchorElement>("[data-scroll-top='true']")
      )

      topLinks.forEach((link) => {
        const handler = (event: Event) => {
          event.preventDefault()

          const tweenState = { y: window.scrollY }
          gsap.to(tweenState, {
            y: 0,
            duration: 1,
            ease: "power3.inOut",
            overwrite: true,
            onUpdate: () => {
              window.scrollTo({ top: tweenState.y })
            },
          })
        }

        link.addEventListener("click", handler)
        listeners.push(() => link.removeEventListener("click", handler))
      })

      return () => {
        listeners.forEach((cleanup) => cleanup())
      }
    })

    return () => ctx.revert()
  }, [])

  return null
}
