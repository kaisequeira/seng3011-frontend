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
          { y: 88, opacity: 0, rotateX: 8 },
          { y: 36, opacity: 1, rotateX: 0, duration: 1 },
          "-=0.45"
        )

        gsap.fromTo(
          heroBrowser,
          { y: 36 },
          {
            y: 0,
            ease: "none",
            immediateRender: false,
            overwrite: "auto",
            scrollTrigger: {
              trigger: heroBrowser,
              start: "top 92%",
              end: "top 30%",
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
