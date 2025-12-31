{
  "phase": 1,
  "project": "Stellium Dashboard",
  "componentHierarchy": {
    "Dashboard": {
      "description": "Root component container for the entire dashboard",
      "children": ["TopHeader", "MainLayout"],
      "state": {
        "currentSection": "string - 'horoscope' | 'birth-charts' | 'relationships'",
        "timePeriod": "string - 'today' | 'week' | 'month'",
        "sidebarOpen": "boolean - mobile sidebar visibility",
        "isLoading": "boolean",
        "error": "string | null"
      },
      "props": {
        "user": {
          "id": "string",
          "name": "string",
          "sunSign": "string",
          "avatar": "string (URL)",
          "isPremium": "boolean"
        }
      }
    },
    "TopHeader": {
      "description": "Fixed header spanning full width, contains branding and user profile",
      "parent": "Dashboard",
      "children": ["HeaderLeft", "HeaderRight"],
      "dimensions": {
        "height": "80px",
        "position": "fixed",
        "zIndex": 1000
      },
      "props": {
        "user": "object - user data",
        "onMenuToggle": "function - handle hamburger menu click (mobile)"
      },
      "state": {
        "none": "Stateless component"
      },
      "children": {
        "HeaderLeft": {
          "description": "Left section with hamburger menu and branding",
          "children": ["MenuToggle", "Branding"],
          "props": {
            "onMenuToggle": "function"
          }
        },
        "HeaderRight": {
          "description": "Right section with user profile, premium badge, manage button",
          "children": ["UserProfile", "PremiumBadge", "ManageButton"],
          "props": {
            "user": "object"
          }
        }
      }
    },
    "MainLayout": {
      "description": "Main content area wrapper containing sidebar and content",
      "parent": "Dashboard",
      "children": ["Sidebar", "ContentArea"],
      "layout": "flex",
      "flexDirection": "row"
    },
    "Sidebar": {
      "description": "Persistent left navigation sidebar",
      "parent": "MainLayout",
      "dimensions": {
        "width": "240px",
        "position": "sticky",
        "top": "80px"
      },
      "children": ["ProfileSection", "PrimaryNav", "SecondaryNav", "LogoutButton"],
      "props": {
        "user": "object",
        "currentSection": "string",
        "onNavClick": "function",
        "isOpen": "boolean (mobile)"
      },
      "state": {
        "none": "Presentation component, state managed in parent"
      },
      "children": {
        "ProfileSection": {
          "description": "User profile display at top of sidebar",
          "children": ["Avatar", "UserName", "SunSign"],
          "props": {
            "user": "object"
          }
        },
        "PrimaryNav": {
          "description": "Main navigation links",
          "children": ["NavItem", "NavItem", "NavItem"],
          "props": {
            "currentSection": "string",
            "onNavClick": "function"
          },
          "items": [
            {
              "id": "horoscope",
              "label": "Horoscope",
              "icon": "optional"
            },
            {
              "id": "birth-charts",
              "label": "Birth Charts",
              "icon": "optional"
            },
            {
              "id": "relationships",
              "label": "Relationships",
              "icon": "optional"
            }
          ]
        },
        "SecondaryNav": {
          "description": "Secondary navigation links",
          "children": ["NavItem", "NavItem"],
          "items": [
            {
              "id": "ask-stellium",
              "label": "Ask Stellium"
            },
            {
              "id": "settings",
              "label": "Settings"
            }
          ]
        },
        "LogoutButton": {
          "description": "Logout button at bottom of sidebar",
          "props": {
            "onLogout": "function"
          }
        }
      }
    },
    "ContentArea": {
      "description": "Main content area containing section content",
      "parent": "MainLayout",
      "flex": 1,
      "children": ["HoroscopeSection", "BirthChartsSection", "RelationshipsSection"],
      "note": "Only one section renders based on currentSection state"
    },
    "HoroscopeSection": {
      "description": "Three-column layout for horoscope view (Phase 1 primary focus)",
      "parent": "ContentArea",
      "layout": "css grid",
      "gridTemplate": "140px 1fr 280px",
      "gap": "24px",
      "children": ["TimeSelector", "HoroscopeCard", "PlanetaryInfluences"],
      "props": {
        "data": {
          "title": "string",
          "content": "string[]",
          "dateRange": "string",
          "keyInfluences": "array"
        },
        "timePeriod": "string",
        "isLoading": "boolean",
        "error": "string | null",
        "onTimePeriodChange": "function",
        "onRefresh": "function"
      },
      "children": {
        "TimeSelector": {
          "description": "Left column - vertical time period button group",
          "dimensions": {
            "width": "140px",
            "position": "sticky",
            "top": "32px"
          },
          "children": ["TimeButton", "TimeButton", "TimeButton"],
          "props": {
            "currentPeriod": "string",
            "onSelect": "function"
          },
          "periods": [
            { "id": "today", "label": "Today" },
            { "id": "week", "label": "This Week" },
            { "id": "month", "label": "This Month" }
          ]
        },
        "HoroscopeCard": {
          "description": "Center column - main horoscope content",
          "flex": 1,
          "children": [
            "CardTitle",
            "CardContent",
            "DateRange",
            "ActionButtons"
          ],
          "props": {
            "title": "string",
            "paragraphs": "string[]",
            "dateRange": "string",
            "isLoading": "boolean",
            "onRefresh": "function",
            "onShare": "function",
            "onSave": "function"
          },
          "children": {
            "CardTitle": {
              "description": "Title text",
              "props": {
                "text": "string"
              }
            },
            "CardContent": {
              "description": "Horoscope paragraphs",
              "props": {
                "paragraphs": "string[]"
              }
            },
            "DateRange": {
              "description": "Date range separator",
              "props": {
                "startDate": "string",
                "endDate": "string"
              }
            },
            "ActionButtons": {
              "description": "Refresh, Share, Save buttons",
              "children": ["Button", "Button", "Button"],
              "props": {
                "onRefresh": "function",
                "onShare": "function",
                "onSave": "function"
              }
            }
          }
        },
        "PlanetaryInfluences": {
          "description": "Right column - key planetary influences list",
          "dimensions": {
            "width": "280px",
            "position": "sticky",
            "top": "32px"
          },
          "children": ["CardTitle", "InfluencesList"],
          "props": {
            "influences": [
              {
                "id": "string",
                "planet1": "string",
                "aspect": "string",
                "planet2": "string",
                "date": "string",
                "exact": "string | null"
              }
            ]
          },
          "children": {
            "InfluencesList": {
              "description": "List of influences",
              "children": ["InfluenceItem"],
              "maxItems": "unlimited (scrollable)"
            },
            "InfluenceItem": {
              "description": "Single planetary influence",
              "props": {
                "planet1": "string",
                "aspect": "string",
                "planet2": "string",
                "date": "string"
              }
            }
          }
        }
      }
    },
    "NavItem": {
      "description": "Reusable navigation item component",
      "props": {
        "id": "string",
        "label": "string",
        "isActive": "boolean",
        "onClick": "function",
        "icon": "string | ReactNode - optional"
      },
      "states": {
        "default": "transparent background, gray text",
        "hover": "text brightens",
        "active": "purple background, white text"
      }
    },
    "Button": {
      "description": "Reusable button component",
      "variants": ["primary", "secondary", "ghost"],
      "props": {
        "variant": "string - default: 'secondary'",
        "size": "string - 'sm' | 'md' | 'lg'",
        "disabled": "boolean",
        "loading": "boolean",
        "onClick": "function",
        "children": "ReactNode",
        "className": "string - custom classes"
      },
      "styling": {
        "sm": "padding: 8px 12px; font-size: 13px",
        "md": "padding: 10px 16px; font-size: 14px",
        "lg": "padding: 12px 20px; font-size: 16px"
      }
    },
    "LoadingState": {
      "description": "Loading skeleton or spinner for async content",
      "usage": "Show while fetching new horoscope data",
      "options": [
        "Spinner in center of card",
        "Skeleton placeholders matching content layout",
        "Fade transition between states"
      ]
    },
    "ErrorState": {
      "description": "Error message display",
      "props": {
        "message": "string",
        "onRetry": "function"
      }
    }
  },
  "globalState": {
    "section": "Current view - 'horoscope' | 'birth-charts' | 'relationships'",
    "timePeriod": "Current time period - 'today' | 'week' | 'month'",
    "horoscopeData": {
      "title": "string",
      "content": "string (full text, may need to be split into paragraphs)",
      "dateRange": "string - 'Dec 29, 2025 - Dec 30, 2025'",
      "keyInfluences": [
        {
          "id": "uuid",
          "planet1": "string",
          "aspect": "string - 'trine' | 'sextile' | 'square' | 'opposition' | etc",
          "planet2": "string",
          "date": "string",
          "exact": "string | null"
        }
      ]
    },
    "user": {
      "id": "uuid",
      "name": "string",
      "sunSign": "string",
      "avatar": "string (URL)",
      "isPremium": "boolean"
    },
    "loading": {
      "horoscope": "boolean",
      "birthCharts": "boolean",
      "relationships": "boolean"
    },
    "errors": {
      "horoscope": "string | null",
      "birthCharts": "string | null",
      "relationships": "string | null"
    }
  },
  "dataFlow": {
    "userSelectsTimePeriod": {
      "trigger": "Click on time button",
      "action": "Update timePeriod state",
      "apiCall": "GET /api/horoscope?period={timePeriod}&userId={userId}",
      "stateUpdate": {
        "loading": true
      },
      "onSuccess": {
        "horoscopeData": "Update with new data",
        "loading": false
      },
      "onError": {
        "error": "Set error message",
        "loading": false
      },
      "ui": "Fade out, show loading, fade in new content"
    },
    "userClicksRefresh": {
      "trigger": "Click refresh button",
      "action": "Re-fetch current period",
      "apiCall": "GET /api/horoscope?period={timePeriod}&userId={userId}&regenerate=true",
      "ui": "Show loading state in card, maintain sticky columns"
    },
    "userClicksShare": {
      "trigger": "Click share button",
      "action": "Open share modal or copy to clipboard",
      "note": "Implementation details in future phase"
    },
    "userClicksSave": {
      "trigger": "Click save button",
      "action": "Save horoscope to favorites",
      "note": "Implementation details in future phase"
    }
  }
}