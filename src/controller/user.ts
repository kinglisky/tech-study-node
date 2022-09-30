import chalk from 'chalk';
import { taskProgress, todayScore, totalScore, userInfo } from '../apis';
import shared from '../shared';
import { formatTask, getCookieIncludesDomain, stringfyCookie } from '../utils';

/**
 * @description 用户信息
 */
export type UserInfo = {
  uid: number;
  nick: string;
  avatarMediaUrl: string | null;
  gmtActive: number;
  orgIds: number[];
};

/**
 * @description 任务列表
 */
export type TaskList = {
  currentScore: number;
  dayMaxScore: number;
  rate: number;
  need: number;
  status: boolean;
  title: string;
}[];

/**
 * @description 渲染用户信息
 * @param userInfo
 * @returns
 */
export const renderUserData = (userInfo: UserInfo) => {
  shared.log.warn(`用户信息`);
  shared.log.info(`昵称: ${chalk.yellow(userInfo.nick)}`);
};

/**
 * @description 渲染用户积分数据
 * @returns
 */
export const renderScoreData = (score: number, total: number) => {
  shared.log.warn(`积分信息`);
  shared.log.info(
    `当天积分: ${chalk.yellow(score)} 分 | 总积分: ${chalk.yellow(total)} 分`
  );
};
/**
 * @description 渲染用户任务数据
 * @param taskList
 */
export const renderTasksData = (taskList: TaskList) => {
  shared.log.warn(`任务进度`);
  shared.log.info(`文章选读: ${chalk.yellow(taskList[0].rate)} %`);
  shared.log.info(`视听学习: ${chalk.yellow(taskList[1].rate)} %`);
  shared.log.info(`每日答题: ${chalk.yellow(taskList[2].rate)} %`);
  shared.log.info(`每周答题: ${chalk.yellow(taskList[3].rate)} %`);
  shared.log.info(`专项练习: ${chalk.yellow(taskList[4].rate)} %`);
};

/**
 * @description 获取用户信息
 */
export const getUserInfo = async () => {
  // 页面
  const page = shared.getPage();
  // 页面不存在
  if (!page) {
    return;
  }
  try {
    // 获取 cookies
    const cookies = await getCookieIncludesDomain(page, '.xuexi.cn');
    // cookie
    const cookie = stringfyCookie(cookies);
    const data = await userInfo(cookie);
    if (data) {
      return <UserInfo>data;
    }
  } catch (e) {}
};

/**
 * @description 获取总积分
 */
export const getTotalScore = async () => {
  // 页面
  const page = shared.getPage();
  // 页面不存在
  if (!page) {
    return;
  }
  try {
    // 获取 cookies
    const cookies = await getCookieIncludesDomain(page, '.xuexi.cn');
    // cookie
    const cookie = stringfyCookie(cookies);
    // 总分
    const res = await totalScore(cookie);
    if (res) {
      // 总分
      const { score } = res;
      return <number>score;
    }
  } catch (e) {}
};

/**
 * @description 获取当天总积分
 */
export const getTodayScore = async () => {
  // 页面
  const page = shared.getPage();
  // 页面不存在
  if (!page) {
    return;
  }
  try {
    // 获取 cookies
    const cookies = await getCookieIncludesDomain(page, '.xuexi.cn');
    // cookie
    const cookie = stringfyCookie(cookies);
    // 当天分数
    const data = await todayScore(cookie);
    if (data) {
      // 总分
      const { score } = data;
      return <number>score;
    }
  } catch (e) {}
};

/**
 * @description 获取任务列表
 */
export const getTaskList = async () => {
  // 页面
  const page = shared.getPage();
  // 页面不存在
  if (!page) {
    return;
  }
  if (page) {
    try {
      // 获取 cookies
      const cookies = await getCookieIncludesDomain(page, '.xuexi.cn');
      // cookie
      const cookie = stringfyCookie(cookies);
      // 任务进度
      const data = await taskProgress(cookie);
      // 请求成功
      if (data) {
        // 进度和当天总分
        const { taskProgress: progess }: { taskProgress: any[] } = data;
        // 进度存在
        if (progess && progess.length) {
          // 进度
          const taskProgress = progess.map(formatTask);
          // 任务列表
          const taskList: TaskList = [];
          // 文章选读
          taskList[0] = {
            title: '文章选读',
            ...taskProgress[0],
          };
          // 视听学习
          taskList[1] = {
            title: '视听学习',
            ...formatTask({
              currentScore:
                taskProgress[1].currentScore + taskProgress[3].currentScore,
              dayMaxScore:
                taskProgress[1].dayMaxScore + taskProgress[3].dayMaxScore,
            }),
          };
          // 每日答题
          taskList[2] = {
            title: '每日答题',
            ...taskProgress[6],
          };
          // 每周答题
          taskList[3] = {
            title: '每周答题',
            ...taskProgress[2],
          };
          // 专项练习
          taskList[4] = {
            title: '专项练习',
            ...taskProgress[5],
          };
          return taskList;
        }
      }
    } catch (e) {}
  }
};
