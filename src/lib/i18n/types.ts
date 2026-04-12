/**
 * CasaFoot – i18n type definitions
 * All user-facing string keys live here.
 * Add a key here first, then fill it in every locale file.
 */

export type Locale = "fr-darija" | "fr";

export interface Translations {
  // ── Auth ─────────────────────────────────────────────────────────
  "auth.app_tagline": string;
  "auth.login.title": string;
  "auth.login.subtitle": string;
  "auth.login.email_label": string;
  "auth.login.email_placeholder": string;
  "auth.login.password_label": string;
  "auth.login.submit": string;
  "auth.login.no_account": string;
  "auth.login.signup_link": string;
  "auth.login.wrong_credentials": string;
  "auth.login.demo_hint": string;
  "auth.signup.title": string;
  "auth.signup.subtitle": string;
  "auth.signup.username_label": string;
  "auth.signup.username_hint": string;
  "auth.signup.email_label": string;
  "auth.signup.password_label": string;
  "auth.signup.confirm_label": string;
  "auth.signup.submit": string;
  "auth.signup.disclaimer": string;
  "auth.signup.already_account": string;
  "auth.signup.login_link": string;
  "auth.signup.check_inbox_title": string;
  "auth.signup.check_inbox_body": string;
  "auth.signup.go_to_login": string;

  // ── Onboarding ────────────────────────────────────────────────────
  "onboarding.step_of": string; // "{n} / {total}"
  "onboarding.step1.title": string;
  "onboarding.step1.subtitle": string;
  "onboarding.step1.name_label": string;
  "onboarding.step1.name_placeholder": string;
  "onboarding.step2.title": string;
  "onboarding.step2.subtitle": string;
  "onboarding.step2.position_label": string;
  "onboarding.step2.foot_label": string;
  "onboarding.step2.foot_left": string;
  "onboarding.step2.foot_right": string;
  "onboarding.step2.foot_both": string;
  "onboarding.step3.title": string;
  "onboarding.step3.subtitle": string;
  "onboarding.step3.neighborhood_label": string;
  "onboarding.step3.bio_label": string;
  "onboarding.step3.bio_placeholder": string;
  "onboarding.step3.bio_hint": string;
  "onboarding.cta_continue": string;
  "onboarding.cta_back": string;
  "onboarding.cta_start": string;
  "onboarding.step_labels.identity": string;
  "onboarding.step_labels.position": string;
  "onboarding.step_labels.location": string;
  "onboarding.error_session": string;

  // ── Navigation ────────────────────────────────────────────────────
  "nav.home": string;
  "nav.matches": string;
  "nav.profile": string;
  "nav.create_match_aria": string;

  // ── Feed ──────────────────────────────────────────────────────────
  "feed.greeting.morning": string;
  "feed.greeting.afternoon": string;
  "feed.greeting.evening": string;
  "feed.open_matches": string;
  "feed.see_all": string;
  "feed.top_players": string;
  "feed.stat.matches": string;
  "feed.stat.rating": string;
  "feed.stat.evals": string;
  "feed.empty.title": string;
  "feed.empty.body": string;
  "feed.empty.cta": string;
  "feed.banner.title": string;
  "feed.banner.body": string;
  "feed.banner.cta": string;

  // ── Matches list ──────────────────────────────────────────────────
  "matches.page_title": string;
  "matches.page_subtitle": string;
  "matches.search_placeholder": string;
  "matches.tab.open": string;
  "matches.tab.my": string;
  "matches.tab.completed": string;
  "matches.empty.open.title": string;
  "matches.empty.open.body": string;
  "matches.empty.my.title": string;
  "matches.empty.my.body": string;
  "matches.empty.completed.title": string;
  "matches.empty.completed.body": string;

  // ── Create match ──────────────────────────────────────────────────
  "create.page_title": string;
  "create.page_subtitle": string;
  "create.section.info": string;
  "create.field.title": string;
  "create.field.title_placeholder": string;
  "create.field.field_name": string;
  "create.field.field_name_placeholder": string;
  "create.field.location": string;
  "create.field.location_placeholder": string;
  "create.section.datetime": string;
  "create.field.date": string;
  "create.field.time": string;
  "create.section.players": string;
  "create.field.max_players_label": string; // "Max joueurs :"
  "create.section.level": string;
  "create.level.beginner.label": string;
  "create.level.beginner.desc": string;
  "create.level.intermediate.label": string;
  "create.level.intermediate.desc": string;
  "create.level.advanced.label": string;
  "create.level.advanced.desc": string;
  "create.level.mixed.label": string;
  "create.level.mixed.desc": string;
  "create.section.price": string;
  "create.field.price_placeholder": string;
  "create.field.price_hint": string;
  "create.section.description": string;
  "create.field.description_placeholder": string;
  "create.field.description_hint": string;
  "create.submit": string;
  "create.validation.title_min": string;
  "create.validation.location_required": string;
  "create.validation.date_required": string;
  "create.validation.time_required": string;
  "create.validation.players_type": string;
  "create.validation.players_min": string;
  "create.validation.players_max": string;

  // ── Match detail ──────────────────────────────────────────────────
  "detail.status.open": string;
  "detail.status.completed": string;
  "detail.status.cancelled": string;
  "detail.status.full": string;
  "detail.organized_by": string;
  "detail.description": string;
  "detail.players_section": string; // "Joueurs (X/Y)" — used as template
  "detail.open_slot": string;
  "detail.joined_msg": string;
  "detail.cta.join": string; // "Rejoindre · {price}"
  "detail.cta.join_free": string;
  "detail.cta.leave": string;
  "detail.cta.complete": string;
  "detail.cta.rate": string;
  "detail.already_rated": string;
  "detail.organizer_hint": string;
  "detail.players_unit": string; // "/{max} joueurs"
  "detail.price_per_player": string; // "{price} MAD / joueur"
  "detail.you_label": string;
  "detail.not_found.title": string;
  "detail.not_found.body": string;
  "detail.not_found.back": string;
  "detail.spots_left": string; // "{n} place" or "{n} places"
  "detail.spots_left_plural": string;

  // ── Match card (shared component) ────────────────────────────────
  "card.status.completed": string;
  "card.status.cancelled": string;
  "card.status.full": string;
  "card.joined_badge": string;
  "card.by": string; // "par"
  "card.more_players": string; // "+{n} autres"
  "card.spots_left": string; // "{n} place"
  "card.spots_left_plural": string; // "{n} places"

  // ── Player card (FIFA-style) ───────────────────────────────────────
  "player_card.details.open_aria": string;
  "player_card.details.title": string;
  "player_card.details.close_aria": string;
  "player_card.details.username": string;
  "player_card.details.bio": string;
  "player_card.details.no_bio": string;
  "player_card.details.foot": string;
  "player_card.details.position": string;
  "player_card.details.member_since": string;

  // ── Profile ────────────────────────────────────────────────────────
  "profile.tab.card": string;
  "profile.tab.stats": string;
  "profile.tab.history": string;
  "profile.stat.matches": string;
  "profile.stat.overall": string;
  "profile.stat.evals": string;
  "profile.settings.edit": string;
  "profile.settings.signout": string;
  "profile.stats.overall_label": string;
  "profile.stats.based_on": string;
  "profile.stats.ratings_unit": string;
  "profile.stats.unlock_hint": string; // "Joue {n}/3 matchs pour débloquer"
  "profile.stats.community_note": string;
  "profile.history.empty_title": string;
  "profile.history.empty_body": string;
  "profile.foot.left": string;
  "profile.foot.right": string;
  "profile.foot.both": string;

  // ── Stat labels (profile + create form) ──────────────────────────
  "stat.pace": string;
  "stat.shooting": string;
  "stat.passing": string;
  "stat.dribbling": string;
  "stat.defense": string;
  "stat.physical": string;
  "stat.fair_play": string;

  // ── Skill levels ──────────────────────────────────────────────────
  "skill.beginner": string;
  "skill.intermediate": string;
  "skill.advanced": string;
  "skill.mixed": string;

  // ── Card tiers ────────────────────────────────────────────────────
  "tier.bronze": string;
  "tier.silver": string;
  "tier.gold": string;
  "tier.elite": string;

  // ── Position labels ───────────────────────────────────────────────
  "pos.GK": string;
  "pos.CB": string;
  "pos.LB": string;
  "pos.RB": string;
  "pos.CDM": string;
  "pos.CM": string;
  "pos.CAM": string;
  "pos.LW": string;
  "pos.RW": string;
  "pos.ST": string;
  "pos.CF": string;

  // ── Rating modal ──────────────────────────────────────────────────
  "rating.title": string;
  "rating.progress": string; // "{n} sur {total}"
  "rating.done_title": string;
  "rating.done_body": string;
  "rating.skip": string;
  "rating.next": string;
  "rating.submit": string;
  "rating.cat.technique.label": string;
  "rating.cat.technique.desc": string;
  "rating.cat.passing_vision.label": string;
  "rating.cat.passing_vision.desc": string;
  "rating.cat.defense.label": string;
  "rating.cat.defense.desc": string;
  "rating.cat.physical_impact.label": string;
  "rating.cat.physical_impact.desc": string;
  "rating.cat.fair_play.label": string;
  "rating.cat.fair_play.desc": string;

  // ── Date formatting ───────────────────────────────────────────────
  "date.today": string;   // "Aujourd'hui"
  "date.tomorrow": string; // "Demain"

  // ── Setup / error screens ─────────────────────────────────────────
  "setup.db_missing.title": string;
  "setup.db_missing.what_to_do": string;
  "setup.db_missing.steps.1": string;
  "setup.db_missing.steps.2": string;
  "setup.db_missing.steps.3": string;
  "setup.db_missing.steps.4": string;
  "setup.no_profile.title": string;
  "setup.no_profile.body": string;
  "setup.no_profile.try": string;
  "setup.no_profile.steps.1": string;
  "setup.no_profile.steps.2": string;
  "setup.no_profile.steps.3": string;
  "setup.back_to_login": string;

  // ── Language switcher ─────────────────────────────────────────────
  "lang.label": string;
  "lang.fr_darija": string;
  "lang.fr": string;

  // ── Reliability ───────────────────────────────────────────────────
  "reliability.label": string;
  "reliability.excellent": string;
  "reliability.solid": string;
  "reliability.risky": string;
  "reliability.new_player": string;
  "reliability.shows_up": string;
  "reliability.no_shows": string;
  "reliability.matches_expected": string;
  "reliability.tooltip": string;

  // ── Attendance ────────────────────────────────────────────────────
  "attendance.section_title": string;
  "attendance.confirm_cta": string;
  "attendance.confirmed_state": string;
  "attendance.decline_cta": string;
  "attendance.declined_state": string;
  "attendance.not_confirmed_state": string;
  "attendance.organizer_summary": string;   // "{confirmed} confirmé(s) · {pending} en attente"
  "attendance.window_hint": string;
  "attendance.players_confirmed": string;   // "{n} confirmé(s)"
  "attendance.change_mind": string;

  // ── Presence / no-show ────────────────────────────────────────────
  "presence.sheet_title": string;
  "presence.sheet_subtitle": string;
  "presence.present": string;
  "presence.no_show": string;
  "presence.confirm_cta": string;
  "presence.skip": string;

  // ── Chat ──────────────────────────────────────────────────────────
  "chat.title": string;
  "chat.empty_title": string;
  "chat.empty_hint": string;
  "chat.placeholder": string;
  "chat.send": string;
  "chat.only_participants": string;
  "chat.loading": string;
  "chat.error_send": string;

  // ── Misc / shared ─────────────────────────────────────────────────
  "misc.free": string;
  "misc.mad_per_player": string;
  "misc.casablanca": string;
  "misc.neighborhood_suffix": string;
}
