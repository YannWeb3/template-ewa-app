(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [3998],
  {
    16244: (e, t, s) => {
      (Promise.resolve().then(s.bind(s, 52076)),
        Promise.resolve().then(s.bind(s, 87265)));
    },
    30285: (e, t, s) => {
      "use strict";
      s.d(t, {
        $: () => c,
      });
      var r = s(95155),
        i = s(12115),
        a = s(99708),
        o = s(74466),
        n = s(59434);
      let l = (0, o.F)(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            variants: {
              variant: {
                default:
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                  "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                  "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
              },
              size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
              },
            },
            defaultVariants: {
              variant: "default",
              size: "default",
            },
          },
        ),
        c = i.forwardRef((e, t) => {
          let { className: s, variant: i, size: o, asChild: c = !1, ...d } = e,
            u = c ? a.DX : "button";
          return (0, r.jsx)(u, {
            className: (0, n.cn)(
              l({
                variant: i,
                size: o,
                className: s,
              }),
            ),
            ref: t,
            ...d,
          });
        });
      c.displayName = "Button";
    },
    52076: (e, t, s) => {
      "use strict";
      s.d(t, {
        CerveauDashboard: () => E,
      });
      var r = s(95155),
        i = s(12115),
        a = s(35695),
        o = s(29489),
        n = s(34825),
        l = s(20502),
        c = s(785),
        d = s(23437),
        u = s(62482),
        h = s(41134),
        m = s(33388),
        x = s(61216),
        g = s(38208),
        p = s(56033),
        b = s(81744),
        f = s(89342),
        v = s(33376),
        w = s(70403),
        j = s(88330),
        N = s(69146),
        A = s(92215),
        y = s(88058),
        C = s(4883),
        k = s(67141),
        S = s(79540),
        F = s(93533),
        R = s(24161),
        P = s(62523),
        D = s(30285);
      let I = {
        "retour-client": {
          label: "Retour client",
          icon: o.A,
          gradient: "from-blue-500/20 to-blue-600/20",
          description: "Reviews montages, retours qualit\xe9, corrections",
        },
        montage: {
          label: "Montage",
          icon: n.A,
          gradient: "from-purple-500/20 to-purple-600/20",
          description:
            "Techniques CapCut, styles, sous-titrage, colorim\xe9trie",
        },
        scripting: {
          label: "Scripting",
          icon: l.A,
          gradient: "from-orange-500/20 to-orange-600/20",
          description: "Structures de scripts, hooks, templates, IA",
        },
        ads: {
          label: "Ads / Pub",
          icon: c.A,
          gradient: "from-red-500/20 to-red-600/20",
          description: "Scripts publicitaires, hooks ads, conversion",
        },
        "audit-profil": {
          label: "Audit profil",
          icon: d.A,
          gradient: "from-cyan-500/20 to-cyan-600/20",
          description: "Audits Instagram, bios, optimisation profil",
        },
        contenu: {
          label: "Contenu / Id\xe9es",
          icon: u.A,
          gradient: "from-yellow-500/20 to-yellow-600/20",
          description: "Id\xe9es de contenu, formats, calendrier \xe9ditorial",
        },
        tournage: {
          label: "Tournage",
          icon: h.A,
          gradient: "from-green-500/20 to-green-600/20",
          description: "Cadrage, lumi\xe8re, b-rolls, setup face cam\xe9ra",
        },
        process: {
          label: "Process",
          icon: m.A,
          gradient: "from-slate-500/20 to-slate-600/20",
          description: "Workflow interne, outils, organisation",
        },
        formation: {
          label: "Formation",
          icon: x.A,
          gradient: "from-indigo-500/20 to-indigo-600/20",
          description:
            "Formations g\xe9n\xe9rales, onboarding, mont\xe9e en comp\xe9tence",
        },
        proposition: {
          label: "Proposition",
          icon: g.A,
          gradient: "from-pink-500/20 to-pink-600/20",
          description: "Propositions clients, offres, pitch",
        },
        stories: {
          label: "Stories",
          icon: p.A,
          gradient: "from-fuchsia-500/20 to-fuchsia-600/20",
          description:
            "Stories Instagram, formats \xe9ph\xe9m\xe8res, engagement",
        },
        outil: {
          label: "Outils / Tutos",
          icon: b.A,
          gradient: "from-amber-500/20 to-amber-600/20",
          description: "Tutoriels outils, Frame.io, Notion, logiciels",
        },
        design: {
          label: "Design / Style",
          icon: f.A,
          gradient: "from-teal-500/20 to-teal-600/20",
          description: "Direction artistique, charte graphique, styles visuels",
        },
        strategie: {
          label: "Strat\xe9gie",
          icon: v.A,
          gradient: "from-emerald-500/20 to-emerald-600/20",
          description: "Positionnement, branding, strat\xe9gie de contenu",
        },
        client: {
          label: "Client",
          icon: w.A,
          gradient: "from-sky-500/20 to-sky-600/20",
          description: "Relation client, suivi, communication",
        },
        conversion: {
          label: "Conversion",
          icon: g.A,
          gradient: "from-rose-500/20 to-rose-600/20",
          description: "Vente, CTA, tunnels, offres",
        },
        viralite: {
          label: "Viralit\xe9",
          icon: j.A,
          gradient: "from-orange-600/20 to-red-600/20",
          description: "Algorithme, tendances, reach, viralit\xe9",
        },
        autre: {
          label: "Autre",
          icon: N.A,
          gradient: "from-gray-500/20 to-gray-600/20",
          description: "Divers, non class\xe9",
        },
      };
      function E(e) {
        let { stats: t, totalEntries: s } = e,
          o = (0, a.useRouter)(),
          [n, l] = (0, i.useState)(""),
          [c, d] = (0, i.useState)(!1);
        function u() {
          n.trim() &&
            (d(!0),
            o.push("/cerveau-ewa?q=".concat(encodeURIComponent(n.trim()))));
        }
        let h = t.reduce((e, t) => e + (t.sources.loom || 0), 0),
          m = t.reduce(
            (e, t) => e + (t.sources.formation || 0) + (t.sources.script || 0),
            0,
          );
        return (0, r.jsxs)("div", {
          className: "space-y-8",
          children: [
            (0, r.jsx)("div", {
              className: "flex items-start justify-between",
              children: (0, r.jsxs)("div", {
                className: "flex items-center gap-4",
                children: [
                  (0, r.jsx)("div", {
                    className:
                      "p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/10",
                    children: (0, r.jsx)(A.A, {
                      className: "h-8 w-8 text-orange-400",
                    }),
                  }),
                  (0, r.jsxs)("div", {
                    children: [
                      (0, r.jsx)("h1", {
                        className: "text-3xl font-bold text-white",
                        children: "Cerveau EWA",
                      }),
                      (0, r.jsxs)("p", {
                        className: "text-sm text-white/40 mt-1",
                        children: [
                          "Base de connaissances interne — ",
                          s,
                          " entr\xe9es",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
            (0, r.jsxs)("div", {
              className: "grid grid-cols-3 gap-4",
              children: [
                (0, r.jsxs)("div", {
                  className:
                    "p-4 rounded-xl border border-white/5 bg-white/[0.02]",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-2 mb-2",
                      children: [
                        (0, r.jsx)(y.A, {
                          className: "h-4 w-4 text-purple-400",
                        }),
                        (0, r.jsx)("span", {
                          className: "text-xs text-white/40",
                          children: "Vid\xe9os Loom",
                        }),
                      ],
                    }),
                    (0, r.jsx)("span", {
                      className: "text-2xl font-bold text-white",
                      children: h,
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className:
                    "p-4 rounded-xl border border-white/5 bg-white/[0.02]",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-2 mb-2",
                      children: [
                        (0, r.jsx)(C.A, {
                          className: "h-4 w-4 text-blue-400",
                        }),
                        (0, r.jsx)("span", {
                          className: "text-xs text-white/40",
                          children: "Formations & Scripts",
                        }),
                      ],
                    }),
                    (0, r.jsx)("span", {
                      className: "text-2xl font-bold text-white",
                      children: m,
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className:
                    "p-4 rounded-xl border border-white/5 bg-white/[0.02]",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-2 mb-2",
                      children: [
                        (0, r.jsx)(k.A, {
                          className: "h-4 w-4 text-orange-400",
                        }),
                        (0, r.jsx)("span", {
                          className: "text-xs text-white/40",
                          children: "Sous-cat\xe9gories",
                        }),
                      ],
                    }),
                    (0, r.jsx)("span", {
                      className: "text-2xl font-bold text-white",
                      children: t.length,
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className: "flex gap-3",
              children: [
                (0, r.jsxs)("div", {
                  className: "relative flex-1",
                  children: [
                    (0, r.jsx)(S.A, {
                      className:
                        "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20",
                    }),
                    (0, r.jsx)(P.p, {
                      placeholder:
                        "Rechercher dans toutes les transcriptions...",
                      value: n,
                      onChange: (e) => l(e.target.value),
                      onKeyDown: (e) => "Enter" === e.key && u(),
                      className:
                        "pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/25 text-base rounded-xl",
                    }),
                  ],
                }),
                (0, r.jsx)(D.$, {
                  onClick: u,
                  disabled: !n.trim() || c,
                  className:
                    "h-12 px-6 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-white rounded-xl",
                  children: c
                    ? (0, r.jsx)(F.A, {
                        className: "h-5 w-5 animate-spin",
                      })
                    : "Chercher",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              children: [
                (0, r.jsx)("h2", {
                  className: "text-lg font-semibold text-white mb-4",
                  children: "Cat\xe9gories",
                }),
                (0, r.jsx)("div", {
                  className:
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                  children: t.map((e) => {
                    let t = I[e.subcategory] || {
                        label: e.subcategory,
                        icon: k.A,
                        gradient: "from-gray-500/20 to-gray-600/20",
                        description: "",
                      },
                      s = t.icon,
                      i = e.sources.loom || 0;
                    return (0, r.jsxs)(
                      "button",
                      {
                        onClick: () =>
                          o.push("/cerveau-ewa/".concat(e.subcategory)),
                        className:
                          "group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "flex items-start justify-between mb-3",
                            children: [
                              (0, r.jsx)("div", {
                                className:
                                  "p-2.5 rounded-xl bg-gradient-to-br ".concat(
                                    t.gradient,
                                  ),
                                children: (0, r.jsx)(s, {
                                  className: "h-5 w-5 text-white/80",
                                }),
                              }),
                              (0, r.jsxs)("div", {
                                className:
                                  "flex items-center gap-1 text-white/20 group-hover:text-white/40 transition-colors",
                                children: [
                                  (0, r.jsx)("span", {
                                    className: "text-xs",
                                    children: "Ouvrir",
                                  }),
                                  (0, r.jsx)(R.A, {
                                    className: "h-3.5 w-3.5",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, r.jsx)("h3", {
                            className:
                              "text-base font-semibold text-white mb-1",
                            children: t.label,
                          }),
                          (0, r.jsx)("p", {
                            className:
                              "text-xs text-white/30 mb-3 line-clamp-2",
                            children: t.description,
                          }),
                          (0, r.jsxs)("div", {
                            className: "flex items-center gap-3",
                            children: [
                              (0, r.jsxs)("span", {
                                className: "text-sm font-medium text-white/60",
                                children: [
                                  e.count,
                                  " entr\xe9e",
                                  e.count > 1 ? "s" : "",
                                ],
                              }),
                              i > 0 &&
                                (0, r.jsxs)("span", {
                                  className:
                                    "flex items-center gap-1 text-xs text-purple-400/60",
                                  children: [
                                    (0, r.jsx)(y.A, {
                                      className: "h-3 w-3",
                                    }),
                                    i,
                                  ],
                                }),
                            ],
                          }),
                        ],
                      },
                      e.subcategory,
                    );
                  }),
                }),
              ],
            }),
          ],
        });
      }
    },
    59434: (e, t, s) => {
      "use strict";
      s.d(t, {
        cn: () => a,
      });
      var r = s(52596),
        i = s(39688);
      function a() {
        for (var e = arguments.length, t = Array(e), s = 0; s < e; s++)
          t[s] = arguments[s];
        return (0, i.QP)((0, r.$)(t));
      }
    },
    62523: (e, t, s) => {
      "use strict";
      s.d(t, {
        p: () => o,
      });
      var r = s(95155),
        i = s(12115),
        a = s(59434);
      let o = i.forwardRef((e, t) => {
        let { className: s, type: i, ...o } = e;
        return (0, r.jsx)("input", {
          type: i,
          className: (0, a.cn)(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            s,
          ),
          ref: t,
          ...o,
        });
      });
      o.displayName = "Input";
    },
    87265: (e, t, s) => {
      "use strict";
      s.d(t, {
        CerveauSearchResults: () => b,
      });
      var r = s(95155),
        i = s(12115),
        a = s(35695),
        o = s(88058),
        n = s(4883),
        l = s(67141),
        c = s(81644),
        d = s(79540),
        u = s(33161),
        h = s(74821),
        m = s(30285),
        x = s(62523);
      let g = {
          "retour-client": "Retour client",
          ads: "Ads / Pub",
          "audit-profil": "Audit profil",
          design: "Design / Style",
          stories: "Stories",
          proposition: "Proposition",
          outil: "Outils / Tutos",
          contenu: "Contenu / Id\xe9es",
          scripting: "Scripting",
          montage: "Montage",
          tournage: "Tournage",
          formation: "Formation",
          strategie: "Strat\xe9gie",
          conversion: "Conversion",
          process: "Process",
          client: "Client",
          viralite: "Viralit\xe9",
          autre: "Autre",
        },
        p = {
          loom: {
            label: "Loom",
            icon: o.A,
            color: "text-purple-400 bg-purple-500/10",
          },
          formation: {
            label: "Formation",
            icon: n.A,
            color: "text-blue-400 bg-blue-500/10",
          },
          script: {
            label: "Script",
            icon: l.A,
            color: "text-orange-400 bg-orange-500/10",
          },
          manual: {
            label: "Manuel",
            icon: l.A,
            color: "text-gray-400 bg-gray-500/10",
          },
          whatsapp: {
            label: "WhatsApp",
            icon: l.A,
            color: "text-green-400 bg-green-500/10",
          },
        };
      function b(e) {
        let { query: t, results: s } = e,
          o = (0, a.useRouter)(),
          [n, l] = (0, i.useState)(t),
          [b, f] = (0, i.useState)(null);
        function v() {
          n.trim() &&
            o.push("/cerveau-ewa?q=".concat(encodeURIComponent(n.trim())));
        }
        return (0, r.jsxs)("div", {
          className: "space-y-6",
          children: [
            (0, r.jsx)("div", {
              className: "flex items-center gap-3",
              children: (0, r.jsxs)(m.$, {
                variant: "ghost",
                size: "sm",
                onClick: () => o.push("/cerveau-ewa"),
                className: "text-white/40 hover:text-white",
                children: [
                  (0, r.jsx)(c.A, {
                    className: "h-4 w-4 mr-1",
                  }),
                  "Retour",
                ],
              }),
            }),
            (0, r.jsxs)("div", {
              className: "flex gap-3",
              children: [
                (0, r.jsxs)("div", {
                  className: "relative flex-1",
                  children: [
                    (0, r.jsx)(d.A, {
                      className:
                        "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20",
                    }),
                    (0, r.jsx)(x.p, {
                      placeholder:
                        "Rechercher dans toutes les transcriptions...",
                      value: n,
                      onChange: (e) => l(e.target.value),
                      onKeyDown: (e) => "Enter" === e.key && v(),
                      className:
                        "pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/25 text-base rounded-xl",
                    }),
                  ],
                }),
                (0, r.jsx)(m.$, {
                  onClick: v,
                  className:
                    "h-12 px-6 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-white rounded-xl",
                  children: "Chercher",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              children: [
                (0, r.jsxs)("p", {
                  className: "text-sm text-white/40 mb-4",
                  children: [
                    s.length,
                    " r\xe9sultat",
                    s.length > 1 ? "s" : "",
                    ' pour "',
                    t,
                    '"',
                  ],
                }),
                (0, r.jsxs)("div", {
                  className: "space-y-3",
                  children: [
                    s.map((e) => {
                      var s;
                      let i =
                          (null == (s = e.metadata) ? void 0 : s.subcategory) ||
                          e.category,
                        a = g[i] || i,
                        n = p[e.source] || p.manual,
                        l = n.icon,
                        c = b === e.id,
                        d = (function (e) {
                          let s =
                              arguments.length > 1 && void 0 !== arguments[1]
                                ? arguments[1]
                                : 300,
                            r = e.toLowerCase(),
                            i = t.toLowerCase(),
                            a = r.indexOf(i);
                          if (-1 === a)
                            return e.slice(0, s) + (e.length > s ? "..." : "");
                          let o = Math.max(0, a - 100),
                            n = Math.min(e.length, a + t.length + 200),
                            l = e.slice(o, n);
                          return (
                            o > 0 && (l = "..." + l),
                            n < e.length && (l += "..."),
                            l
                          );
                        })(e.content);
                      return (0, r.jsxs)(
                        "div",
                        {
                          className:
                            "rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden",
                          children: [
                            (0, r.jsxs)("button", {
                              onClick: () => f(c ? null : e.id),
                              className:
                                "w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.03] transition-colors",
                              children: [
                                (0, r.jsx)("div", {
                                  className: "p-2 rounded-lg shrink-0 ".concat(
                                    n.color,
                                  ),
                                  children: (0, r.jsx)(l, {
                                    className: "h-4 w-4",
                                  }),
                                }),
                                (0, r.jsxs)("div", {
                                  className: "flex-1 min-w-0",
                                  children: [
                                    (0, r.jsx)("h3", {
                                      className:
                                        "text-sm font-medium text-white truncate",
                                      children: e.title,
                                    }),
                                    (0, r.jsxs)("div", {
                                      className: "flex items-center gap-3 mt-1",
                                      children: [
                                        (0, r.jsx)("span", {
                                          className: "text-xs text-white/20",
                                          children: a,
                                        }),
                                        (0, r.jsx)("span", {
                                          className: "text-xs text-white/15",
                                          children: new Date(
                                            e.created_at,
                                          ).toLocaleDateString("fr-FR"),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                c
                                  ? (0, r.jsx)(u.A, {
                                      className:
                                        "h-4 w-4 text-white/20 shrink-0",
                                    })
                                  : (0, r.jsx)(h.A, {
                                      className:
                                        "h-4 w-4 text-white/20 shrink-0",
                                    }),
                              ],
                            }),
                            c &&
                              (0, r.jsxs)("div", {
                                className:
                                  "border-t border-white/5 p-4 space-y-3",
                                children: [
                                  (0, r.jsx)("p", {
                                    className:
                                      "text-sm text-white/50 leading-relaxed",
                                    children: d,
                                  }),
                                  (0, r.jsx)(m.$, {
                                    variant: "outline",
                                    size: "sm",
                                    onClick: () =>
                                      o.push(
                                        "/cerveau-ewa/"
                                          .concat(i, "/")
                                          .concat(e.id),
                                      ),
                                    className:
                                      "border-white/10 text-white/60 hover:text-white",
                                    children: "Voir en d\xe9tail",
                                  }),
                                ],
                              }),
                          ],
                        },
                        e.id,
                      );
                    }),
                    0 === s.length &&
                      (0, r.jsxs)("div", {
                        className: "text-center py-12 text-white/30",
                        children: [
                          (0, r.jsx)(d.A, {
                            className: "h-10 w-10 mx-auto mb-3 opacity-30",
                          }),
                          (0, r.jsxs)("p", {
                            children: ['Aucun r\xe9sultat pour "', t, '"'],
                          }),
                          (0, r.jsx)("p", {
                            className: "text-xs mt-1",
                            children: "Essaie avec d'autres mots-cl\xe9s",
                          }),
                        ],
                      }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
    },
  },
  (e) => {
    var t = (t) => e((e.s = t));
    (e.O(0, [8385, 7981, 8441, 1684, 7358], () => t(16244)), (_N_E = e.O()));
  },
]);
