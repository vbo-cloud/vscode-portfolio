// Pure logic for the TERMINAL game (Donjon). Single level. The dungeon's
// structure (at most 4 parallel linear corridors) and the boss's location
// are visible from the start, but a room's contents — up to 2 named
// monsters — stay hidden until the room is entered. Monsters share the
// player's toolkit (dice attacks, overflow shield, load, restore) behind a
// small chance-based AI, and every one of them in the room answers each
// player action. Kills drop coins and sometimes an upgrade INTO the room
// (`rm *` collects); a permanent `~/shop` sells the same upgrades.

export type Status = 'playing' | 'won' | 'lost';

export type EnemyTier = 'weak' | 'medium' | 'strong' | 'boss';

/** Permanent player upgrades, dropped by monsters or sold in ~/shop. */
export type Upgrade = 'd8' | 'dmg' | 'die' | 'shield';

export interface Loot {
    coins: number;
    upgrades: Upgrade[];
}

export interface ShopItem {
    id: Upgrade;
    price: number;
    /** the one discounted item (−30%) */
    sale: boolean;
    sold: boolean;
}

export interface Enemy {
    /** typeable target for `shoot <name>` — unique within its room */
    name: string;
    tier: EnemyTier;
    /** current hit points — <= 0 once defeated */
    hp: number;
    maxHp: number;
    /** same rules as the player's shield: absorbs the hit, overflow bleeds to HP */
    shield: number;
    /** dice loaded for its next attack (reset to 1 after attacking or on HP damage) */
    dice: number;
    maxDice: number;
    /** basic AI: chance to load a die instead of shooting */
    loadChance: number;
    /** basic AI: chance to reroll its shield when it is down */
    restoreChance: number;
}

export interface Room {
    id: number;
    name: string;
    parent: number;
    depth: number;
    children: number[];
    enemies: Enemy[];
    /** dropped by kills, waits on the floor until `rm *` */
    loot: Loot;
}

export interface GameState {
    rooms: Room[];
    cwd: number;
    /** rooms already entered — their contents are revealed, trail shown green */
    visited: ReadonlySet<number>;
    bossId: number;
    shopId: number;
    shopItems: ShopItem[];
    hp: number;
    maxHp: number;
    /** absorbs the hit; breaks when the hit >= its value, surplus bleeds to HP */
    shield: number;
    /** dice thrown by the next shoot: baseDice + loaded, rolled at shoot time */
    dice: number;
    /** floor of the reserve — grows with the rare `die` upgrade */
    baseDice: number;
    /** attack dice upgraded from d6 to d8, always spent first */
    d8Count: number;
    /** flat damage added to every shot */
    dmgBonus: number;
    /** flat bonus added to every shield reroll (2d6+bonus) */
    shieldBonus: number;
    coins: number;
    status: Status;
}

export type LineKind = 'info' | 'dim' | 'warn' | 'error' | 'success' | 'echo';

export interface LogLine {
    text: string;
    kind: LineKind;
}

/** One visual beat for the UI: a dice roll (or plain badge) above a room. */
export interface GameEvent {
    roomId: number;
    actor: 'player' | 'enemy';
    /** dice shown rolling before the label settles — omit for roll-less actions */
    rolls?: number[];
    label: string;
}

export interface CommandResult {
    state: GameState;
    lines: LogLine[];
    events?: GameEvent[];
    requestNew?: boolean;
}

interface TierStats {
    hp: [number, number];
    shield: [number, number];
    maxDice: number;
    loadChance: number;
    restoreChance: number;
}

// Single level. Empirically calibrated with the scratchpad sim (2000 runs):
// a player who restores whenever the shield is down virtually always wins;
// one who only ever shoots wins ~36% of runs. Rooms host up to 2 monsters
// and every living one answers each player action, so double rooms are the
// spikes of the run. Kills drop coins scaled on the tier.
export const CONFIG = {
    corridors: 3,
    corridorLen: [2, 4] as [number, number],
    /** "monsters in roughly half the rooms" */
    enemyChance: 0.5,
    twoMonstersChance: 0.3,
    playerHp: 30,
    /** chance that a kill also drops an upgrade */
    dropChance: 0.35,
    /** chance that an elite (strong) kill drops the shield-dice upgrade instead */
    eliteShieldDropChance: 0.6,
    tiers: {
        weak: { hp: [3, 5], shield: [0, 0], maxDice: 1, loadChance: 0, restoreChance: 0 },
        medium: { hp: [5, 7], shield: [0, 3], maxDice: 2, loadChance: 0.3, restoreChance: 0 },
        strong: { hp: [8, 10], shield: [2, 4], maxDice: 2, loadChance: 0.3, restoreChance: 0.25 },
    } as Record<Exclude<EnemyTier, 'boss'>, TierStats>,
    boss: { hp: [15, 18], shield: [3, 5], maxDice: 3, loadChance: 0.3, restoreChance: 0.25 } as TierStats,
    coins: {
        weak: [1, 3],
        medium: [3, 6],
        strong: [6, 10],
        boss: [15, 25],
    } as Record<EnemyTier, [number, number]>,
};

export const UPGRADE_INFO: Record<Upgrade, { label: string; price: number; rare: boolean }> = {
    d8: { label: 'd6→d8', price: 5, rare: false },
    dmg: { label: '+1 dégât', price: 5, rare: false },
    die: { label: '+1 dé', price: 10, rare: true },
    shield: { label: '+2 dés bouclier', price: 5, rare: false },
};

export const salePrice = (item: ShopItem): number =>
    item.sale ? Math.ceil(item.price * 0.7) : item.price;

const ROOM_NAMES = [
    'src', 'dist', 'node_modules', 'build', 'cache', 'logs', 'assets', 'vendor',
    'tests', 'docs', 'tmp', 'config', 'scripts', 'public', 'data', 'core',
    'lib', 'api', 'bin', 'pkg',
];

const MONSTER_NAMES: Record<Exclude<EnemyTier, 'boss'>, string[]> = {
    weak: ['typo', 'warning', 'segfault', 'null-ptr', 'off-by-one'],
    medium: ['worm', 'trojan', 'mem-leak', 'race-cond', 'zombie-proc'],
    strong: ['rootkit', 'daemon', 'kernel-panic', 'fork-bomb', 'heisenbug'],
};

const shuffle = <T,>(items: T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

const d6 = () => randInt(1, 6);
const d8 = () => randInt(1, 8);

const emptyLoot = (): Loot => ({ coins: 0, upgrades: [] });

const livingEnemies = (room: Room): Enemy[] => room.enemies.filter(e => e.hp > 0);

/** Reserve ceiling: 2 loadable dice on top of the base throw. */
const maxReserve = (state: GameState): number => state.baseDice + 2;

/** Monster tier grows with relative depth in its corridor. */
const tierForDepth = (depth: number, maxDepth: number): Exclude<EnemyTier, 'boss'> => {
    const ratio = depth / Math.max(1, maxDepth);
    if (ratio <= 0.4) return 'weak';
    if (ratio <= 0.75) return 'medium';
    return 'strong';
};

const makeEnemy = (name: string, tier: EnemyTier, stats: TierStats): Enemy => {
    const hp = randInt(stats.hp[0], stats.hp[1]);
    return {
        name,
        tier,
        hp,
        maxHp: hp,
        shield: randInt(stats.shield[0], stats.shield[1]),
        dice: 1,
        maxDice: stats.maxDice,
        loadChance: stats.loadChance,
        restoreChance: stats.restoreChance,
    };
};

export const createGame = (): GameState => {
    const names = shuffle(ROOM_NAMES);
    const rooms: Room[] = [
        { id: 0, name: '~', parent: -1, depth: 0, children: [], enemies: [], loot: emptyLoot() },
    ];
    // Up to 4 parallel linear corridors; the boss corridor is stretched to
    // the longest length so the boss room is the deepest.
    const lengths = Array.from({ length: CONFIG.corridors }, () => randInt(CONFIG.corridorLen[0], CONFIG.corridorLen[1]));
    const bossCorridor = randInt(0, CONFIG.corridors - 1);
    lengths[bossCorridor] = Math.max(...lengths);
    let bossId = 0;
    let nameIdx = 0;
    lengths.forEach((len, c) => {
        let parent = 0;
        for (let i = 0; i < len; i++) {
            const room: Room = {
                id: rooms.length,
                name: names[nameIdx++],
                parent,
                depth: i + 1,
                children: [],
                enemies: [],
                loot: emptyLoot(),
            };
            rooms[parent].children.push(room.id);
            rooms.push(room);
            parent = room.id;
        }
        if (c === bossCorridor) bossId = parent;
    });
    // The shop is a permanent, monster-free room right off the entrance.
    const shopId = rooms.length;
    rooms.push({ id: shopId, name: 'shop', parent: 0, depth: 1, children: [], enemies: [], loot: emptyLoot() });
    rooms[0].children.push(shopId);
    const pools: Record<Exclude<EnemyTier, 'boss'>, string[]> = {
        weak: shuffle(MONSTER_NAMES.weak),
        medium: shuffle(MONSTER_NAMES.medium),
        strong: shuffle(MONSTER_NAMES.strong),
    };
    const draw = (tier: Exclude<EnemyTier, 'boss'>): string => {
        if (pools[tier].length === 0) pools[tier] = shuffle(MONSTER_NAMES[tier]);
        return pools[tier].pop()!;
    };
    const maxDepth = Math.max(...lengths);
    for (const room of rooms) {
        if (room.id === 0 || room.id === shopId) continue;
        if (room.id === bossId) {
            room.enemies = [makeEnemy('boss', 'boss', CONFIG.boss)];
        } else if (Math.random() < CONFIG.enemyChance) {
            const count = Math.random() < CONFIG.twoMonstersChance ? 2 : 1;
            for (let i = 0; i < count; i++) {
                const tier = tierForDepth(room.depth, maxDepth);
                let name = draw(tier);
                while (room.enemies.some(e => e.name === name)) name = draw(tier);
                room.enemies.push(makeEnemy(name, tier, CONFIG.tiers[tier]));
            }
        }
    }
    const shopItems: ShopItem[] = (Object.keys(UPGRADE_INFO) as Upgrade[]).map(id => ({
        id,
        price: UPGRADE_INFO[id].price,
        sale: false,
        sold: false,
    }));
    shopItems[randInt(0, shopItems.length - 1)].sale = true;
    return {
        rooms,
        cwd: 0,
        visited: new Set<number>([0]),
        bossId,
        shopId,
        shopItems,
        hp: CONFIG.playerHp,
        maxHp: CONFIG.playerHp,
        shield: d6() + d6(),
        dice: 1,
        baseDice: 1,
        d8Count: 0,
        dmgBonus: 0,
        shieldBonus: 0,
        coins: 0,
        status: 'playing',
    };
};

const HELP: LogLine[] = [
    {
        text: 'cd <chemin|..> avance · shoot <monstre> tire les dés en réserve · load +1 dé · restore relance le bouclier (2d6+bonus) · rm * ramasse le butin · buy <article> dans ~/shop · new relance — les monstres jouent avec les mêmes règles.',
        kind: 'dim',
    },
];

const err = (state: GameState, text: string): CommandResult => ({
    state,
    lines: [{ text, kind: 'error' }],
});

const cloneRooms = (rooms: Room[]): Room[] =>
    rooms.map(r => ({
        ...r,
        children: [...r.children],
        enemies: r.enemies.map(e => ({ ...e })),
        loot: { coins: r.loot.coins, upgrades: [...r.loot.upgrades] },
    }));

/** Can the player still benefit from this upgrade? */
const canApply = (state: GameState, upgrade: Upgrade): boolean => {
    switch (upgrade) {
        case 'd8': return state.d8Count < maxReserve(state);
        case 'dmg': return state.dmgBonus < 4;
        case 'die': return state.baseDice < 3;
        case 'shield': return state.shieldBonus < 6;
    }
};

const applyUpgrade = (state: GameState, upgrade: Upgrade): GameState => {
    switch (upgrade) {
        case 'd8': return { ...state, d8Count: state.d8Count + 1 };
        case 'dmg': return { ...state, dmgBonus: state.dmgBonus + 1 };
        case 'die': return { ...state, baseDice: state.baseDice + 1, dice: state.dice + 1 };
        case 'shield': return { ...state, shieldBonus: state.shieldBonus + 2 };
    }
};

/** Small random reward on a kill — elites favour the shield-dice upgrade. */
const rollDrop = (state: GameState, tier: EnemyTier): Upgrade | null => {
    if (tier === 'strong' && canApply(state, 'shield') && Math.random() < CONFIG.eliteShieldDropChance) {
        return 'shield';
    }
    if (Math.random() >= CONFIG.dropChance) return null;
    const pool: Upgrade[] = [];
    if (canApply(state, 'd8')) pool.push('d8', 'd8', 'd8');
    if (canApply(state, 'dmg')) pool.push('dmg', 'dmg', 'dmg');
    if (canApply(state, 'die')) pool.push('die'); // rare
    if (pool.length === 0) return null;
    return pool[randInt(0, pool.length - 1)];
};

/**
 * A hit against the player. The shield absorbs it: it survives unchanged
 * when the hit is strictly weaker, breaks otherwise — and any damage beyond
 * the shield's value bleeds through to HP. HP damage dumps loaded dice.
 */
const takeHit = (state: GameState, dmg: number): { state: GameState; outcome: string } => {
    if (state.shield > 0) {
        if (dmg < state.shield) return { state, outcome: 'absorbé' };
        const surplus = dmg - state.shield;
        if (surplus === 0) return { state: { ...state, shield: 0 }, outcome: 'brise ton bouclier !' };
        return {
            state: { ...state, shield: 0, hp: state.hp - surplus, dice: state.baseDice },
            outcome: `bouclier brisé · −${surplus} PV !`,
        };
    }
    return { state: { ...state, hp: state.hp - dmg, dice: state.baseDice }, outcome: `−${dmg} PV !` };
};

/**
 * Basic monster AI, played on the (already cloned) monster after every
 * player action it survives: reroll its shield when broken, sometimes bank
 * an extra die, otherwise attack with everything loaded.
 */
const enemyTurn = (state: GameState, enemy: Enemy): { state: GameState; event: GameEvent } => {
    const roomId = state.cwd;
    if (enemy.shield === 0 && enemy.restoreChance > 0 && Math.random() < enemy.restoreChance) {
        const rolls = [d6(), d6()];
        enemy.shield = rolls[0] + rolls[1];
        return { state, event: { roomId, actor: 'enemy', rolls, label: `${enemy.name} 🛡 ${enemy.shield}` } };
    }
    if (enemy.dice < enemy.maxDice && Math.random() < enemy.loadChance) {
        enemy.dice += 1;
        return { state, event: { roomId, actor: 'enemy', label: `${enemy.name} charge (×${enemy.dice})` } };
    }
    const rolls = Array.from({ length: enemy.dice }, d6);
    enemy.dice = 1;
    const dmg = rolls.reduce((a, b) => a + b, 0);
    const hit = takeHit(state, dmg);
    return { state: hit.state, event: { roomId, actor: 'enemy', rolls, label: `${enemy.name} ${hit.outcome}` } };
};

/** Player action done — every living monster in the room answers in turn. */
const settleTurn = (state: GameState, events: GameEvent[]): CommandResult => {
    let next = state;
    for (const enemy of livingEnemies(next.rooms[next.cwd])) {
        const turn = enemyTurn(next, enemy);
        next = turn.state;
        events.push(turn.event);
        if (next.hp <= 0) {
            return {
                state: { ...next, hp: 0, status: 'lost' },
                lines: [{ text: 'GAME OVER — tape `new`.', kind: 'error' }],
                events,
            };
        }
    }
    return { state: next, lines: [], events };
};

/** Parse and run one typed command. */
export const executeCommand = (state: GameState, input: string): CommandResult => {
    const tokens = input.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return { state, lines: [] };
    const cmd = tokens[0].toLowerCase();
    const arg = tokens.slice(1).join(' ');

    if (cmd === 'help') return { state, lines: HELP };
    if (cmd === 'new') return { state, lines: [], requestNew: true };

    const known = ['cd', 'move', 'shoot', 'load', 'restore', 'rm', 'buy', 'install'];
    if (!known.includes(cmd)) {
        return err(state, `Commande inconnue : \`${cmd}\`. Tape \`help\`.`);
    }
    if (state.status !== 'playing') {
        return err(state, 'La partie est terminée. Tape `new` pour un nouveau donjon.');
    }

    if (cmd === 'cd' || cmd === 'move') {
        // The structure is visible so any room name resolves, but contents
        // are hidden: walking into a room with living monsters stops the
        // trip there (ambush). Leaving the current room downward while
        // monsters live here is refused; retreat (`..`) is always free.
        const segments = arg.split('/').filter(Boolean);
        if (segments.length === 0) return err(state, 'Usage : cd <chemin> ou cd ..');
        let cur = state.cwd;
        const walked: number[] = [];
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (seg === '..') {
                if (state.rooms[cur].parent === -1) return err(state, 'Tu es déjà à l’entrée du donjon.');
                cur = state.rooms[cur].parent;
                walked.push(cur);
                continue;
            }
            const blockers = livingEnemies(state.rooms[cur]);
            if (blockers.length > 0) {
                if (cur === state.cwd) {
                    return err(state, `cd: ${blockers.map(b => b.name).join(' + ')} bloque${blockers.length > 1 ? 'nt' : ''} le passage — abats-les ou bats en retraite (\`..\`).`);
                }
                break; // ambushed mid-trip: the walk ends in this room
            }
            const child = state.rooms[cur].children.find(c => state.rooms[c].name === seg);
            if (child === undefined) {
                return err(state, `cd: ${segments.slice(i).join('/')}: chemin introuvable.`);
            }
            cur = child;
            walked.push(cur);
        }
        const visited = new Set(state.visited);
        walked.forEach(id => visited.add(id));
        const foes = livingEnemies(state.rooms[cur]);
        const events: GameEvent[] =
            foes.length > 0
                ? [{ roomId: cur, actor: 'enemy', label: `${foes.map(f => f.name).join(' + ')} !` }]
                : [];
        return { state: { ...state, cwd: cur, visited }, lines: [], events };
    }

    // The remaining commands work on a cloned tree: the monsters answering
    // the action (and the looted rooms) mutate their own copies.
    const rooms = cloneRooms(state.rooms);
    const foes = livingEnemies(rooms[state.cwd]);

    if (cmd === 'rm') {
        if (arg !== '*') return err(state, 'Usage : rm * — ramasse tout le butin du dossier.');
        const room = rooms[state.cwd];
        if (room.loot.coins === 0 && room.loot.upgrades.length === 0) {
            return err(state, 'rm: rien à ramasser ici.');
        }
        let next: GameState = { ...state, rooms, coins: state.coins + room.loot.coins };
        const events: GameEvent[] = [];
        if (room.loot.coins > 0) {
            events.push({ roomId: state.cwd, actor: 'player', label: `+${room.loot.coins} pièces` });
        }
        for (const upgrade of room.loot.upgrades) {
            if (canApply(next, upgrade)) {
                next = applyUpgrade(next, upgrade);
                events.push({ roomId: state.cwd, actor: 'player', label: UPGRADE_INFO[upgrade].label });
            } else {
                next = { ...next, coins: next.coins + 2 };
                events.push({ roomId: state.cwd, actor: 'player', label: '+2 pièces (déjà au max)' });
            }
        }
        room.loot = emptyLoot();
        return settleTurn(next, events);
    }

    if (cmd === 'buy' || cmd === 'install') {
        if (state.cwd !== state.shopId) {
            return err(state, 'buy: pas de shop ici — le magasin est dans ~/shop.');
        }
        const onSale = state.shopItems.filter(i => !i.sold);
        if (!arg) {
            return err(state, `Usage : buy <article> — dispo : ${onSale.map(i => i.id).join(', ') || 'rien, tout est vendu'}.`);
        }
        const item = onSale.find(i => i.id === arg.toLowerCase());
        if (!item) return err(state, `buy: ${arg}: article inconnu ou déjà vendu.`);
        const price = salePrice(item);
        if (state.coins < price) return err(state, `buy: il te faut ${price} pièces (tu en as ${state.coins}).`);
        if (!canApply(state, item.id)) return err(state, `buy: ${item.id}: amélioration déjà au maximum.`);
        let next: GameState = {
            ...state,
            rooms,
            coins: state.coins - price,
            shopItems: state.shopItems.map(i => (i.id === item.id ? { ...i, sold: true } : i)),
        };
        next = applyUpgrade(next, item.id);
        return {
            state: next,
            lines: [],
            events: [{ roomId: state.cwd, actor: 'player', label: `${UPGRADE_INFO[item.id].label} · −${price} pièces` }],
        };
    }

    if (cmd === 'shoot') {
        if (foes.length === 0) return err(state, 'shoot: aucun monstre ici.');
        let target: Enemy | undefined;
        if (arg) {
            target = foes.find(f => f.name === arg.toLowerCase());
            if (!target) return err(state, `shoot: ${arg}: pas de monstre de ce nom ici (${foes.map(f => f.name).join(', ')}).`);
        } else {
            if (foes.length > 1) {
                return err(state, `shoot: plusieurs monstres ici — précise la cible : ${foes.map(f => f.name).join(', ')}.`);
            }
            target = foes[0];
        }
        // Dice are rolled at this very moment — never pre-rolled. Upgraded
        // d8s are always thrown first, then the flat bonus is added.
        const nD8 = Math.min(state.d8Count, state.dice);
        const rolls = [
            ...Array.from({ length: nD8 }, d8),
            ...Array.from({ length: state.dice - nD8 }, d6),
        ];
        const dmg = rolls.reduce((a, b) => a + b, 0) + state.dmgBonus;
        let next: GameState = { ...state, rooms, dice: state.baseDice };
        const events: GameEvent[] = [];
        // The monster's shield follows the same rules as the player's:
        // absorb below its value, break at or above it, surplus hits HP.
        let hpDmg = dmg;
        let brokeShield = false;
        if (target.shield > 0) {
            if (dmg < target.shield) {
                events.push({ roomId: state.cwd, actor: 'player', rolls, label: `absorbé (🛡 ${target.shield})` });
                return settleTurn(next, events);
            }
            hpDmg = dmg - target.shield;
            target.shield = 0;
            brokeShield = true;
            if (hpDmg === 0) {
                events.push({ roomId: state.cwd, actor: 'player', rolls, label: `bouclier de ${target.name} brisé !` });
                return settleTurn(next, events);
            }
        }
        target.hp -= hpDmg;
        target.dice = 1; // HP damage dumps its loaded dice, like the player
        const prefix = brokeShield ? 'bouclier brisé · ' : '';
        if (target.hp <= 0) {
            if (target.tier === 'boss') {
                events.push({ roomId: state.cwd, actor: 'player', rolls, label: `${prefix}BOSS vaincu !` });
                return {
                    state: { ...next, status: 'won' },
                    lines: [{ text: 'VICTOIRE — tape `new`.', kind: 'success' }],
                    events,
                };
            }
            // Coins and the odd upgrade drop on the floor of the monster's
            // folder — nothing is gained until `rm *` sweeps it.
            const [lo, hi] = CONFIG.coins[target.tier];
            const room = rooms[state.cwd];
            room.loot.coins += randInt(lo, hi);
            const drop = rollDrop(next, target.tier);
            if (drop) room.loot.upgrades.push(drop);
            events.push({ roomId: state.cwd, actor: 'player', rolls, label: `${prefix}${target.name} ✝ · butin (rm *)` });
            return settleTurn(next, events);
        }
        events.push({ roomId: state.cwd, actor: 'player', rolls, label: `${prefix}${target.name} −${hpDmg} PV` });
        return settleTurn(next, events);
    }

    if (cmd === 'load') {
        if (state.dice >= maxReserve(state)) {
            return err(state, `load: réserve pleine (${maxReserve(state)} dés max).`);
        }
        const next = { ...state, rooms, dice: state.dice + 1 };
        return settleTurn(next, [{ roomId: state.cwd, actor: 'player', label: `+1 dé (×${next.dice})` }]);
    }

    // restore — reroll the shield: 2d6+bonus REPLACES its value, it can come out lower.
    const rolls = [d6(), d6()];
    const next = { ...state, rooms, shield: rolls[0] + rolls[1] + state.shieldBonus };
    return settleTurn(next, [{ roomId: state.cwd, actor: 'player', rolls, label: `bouclier ${next.shield}` }]);
};
