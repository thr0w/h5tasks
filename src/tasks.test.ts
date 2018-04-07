import Tasks from "./tasks";

// tslint:disable:object-literal-sort-keys

describe("task - simple ", () => {
  it("task - simple", async () => {
    Tasks.reset();
    expect({ antes: Tasks.list.length }).toEqual({ antes: 0 });
    Tasks.log("log1", "arg");
    let self;
    const task = Tasks.declare({
      name: "simple",
      async resolver() {
        self = this;
        return "ok";
      },
    });
    task.log("log2", "arg");
    expect({
      depois1: Tasks.list.length,
      parent: task.parent,
      name: task.name,
      fullname: task.fullname,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      depois1: 1,
      parent: undefined,
      name: "simple",
      fullname: "simple",
      pending: true,
      running: false,
      success: false,
      failed: false,
    });
    const val = await task.then();
    expect({
      val,
      depois2: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      val: "ok",
      depois2: 1,
      pending: false,
      running: false,
      success: true,
      failed: false,
    });
  });

  it("task - simple throw", async () => {
    Tasks.reset();
    expect({ antes: Tasks.list.length }).toEqual({ antes: 0 });
    const task = Tasks.declare({
      name: "simple",
      resolver() {
        throw new Error("failed");
      },
    });
    expect({
      depois1: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      depois1: 1,
      pending: true,
      running: false,
      success: false,
      failed: false,
    });
    let sucesso = false;
    try {
      await task.then();
      sucesso = true;
    } catch (e) {
      expect({ message: Tasks.list[0].reason.message })
        .toEqual({ message: e.message });
    }
    expect({
      sucesso,
      depois2: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      sucesso: false,
      depois2: 1,
      pending: false,
      running: false,
      success: false,
      failed: true,
    });
  });

  it("task - simple throw with capture", async () => {
    let errosCapturados = 0;
    Tasks.reset();
    Tasks.on.error(captura_erro);
    Tasks.on.error(captura_erro);

    expect({ antes1: Tasks.list.length }).toEqual({ antes1: 0 });
    const task1 = Tasks.declare({
      name: "simple",
      resolver() {
        throw new Error("failed");
      },
    });
    expect({
      depois1: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      depois1: 1,
      pending: true,
      running: false,
      success: false,
      failed: false,
    });
    let sucesso1 = false;
    try {
      await task1.then();
      sucesso1 = true;
    } catch (e) {
      expect({ message: Tasks.list[0].reason.message })
        .toEqual({ message: e.message });
    }
    await Tasks.delay(10);
    expect({
      erros_capturados1: errosCapturados,
      sucesso1,
      depois2: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      erros_capturados1: 1,
      sucesso1: false,
      depois2: 1,
      pending: false,
      running: false,
      success: false,
      failed: true,
    });

    Tasks.off.error(captura_erro);
    Tasks.off.error(captura_erro);

    expect({ antes2: Tasks.list.length }).toEqual({ antes2: 1 });
    const task2 = Tasks.declare({
      name: "simple",
      resolver() {
        throw new Error("failed");
      },
    });
    expect({
      depois3: Tasks.list.length,
      pending: Tasks.list[1].pending,
      running: Tasks.list[1].running,
      success: Tasks.list[1].success,
      failed: Tasks.list[1].failed,
    }).toEqual({
      depois3: 2,
      pending: true,
      running: false,
      success: false,
      failed: false,
    });
    let sucesso2 = false;
    try {
      await task2.then();
      sucesso2 = true;
    } catch (e) {
      expect({ message: Tasks.list[1].reason.message })
        .toEqual({ message: e.message });
    }
    await Tasks.delay(10);
    expect({
      sucesso2,
      erros_capturados2: errosCapturados,
      depois4: Tasks.list.length,
      pending: Tasks.list[1].pending,
      running: Tasks.list[1].running,
      success: Tasks.list[1].success,
      failed: Tasks.list[1].failed,
    }).toEqual({
      sucesso2: false,
      depois4: 2,
      erros_capturados2: errosCapturados,
      pending: false,
      running: false,
      success: false,
      failed: true,
    });

    function captura_erro(err: Error) {
      errosCapturados++;
    }
  });

  it("task - simple without resolver", async () => {
    Tasks.reset();
    expect({ antes: Tasks.list.length }).toEqual({ antes: 0 });
    const task = Tasks.declare({
      name: "simple",
    });
    expect({
      depois1: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      depois1: 1,
      pending: true,
      running: false,
      success: false,
      failed: false,
    });
    task.was.started();
    expect({
      depois2: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      depois2: 1,
      pending: true,
      running: true,
      success: false,
      failed: false,
    });
    Tasks.asap(() => task.was.successed("ok"));
    const val = await task.then();
    expect({
      val,
      depois3: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      val: "ok",
      depois3: 1,
      pending: false,
      running: false,
      success: true,
      failed: false,
    });
  });

  it("task - async", async () => {
    Tasks.reset();
    expect({ antes: Tasks.list.length }).toEqual({ antes: 0 });
    const task = Tasks.declare({
      name: "simple",
      async resolver() {
        return new Promise((resolve) => resolve("ok"));
      },
    });
    expect({
      depois1: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      depois1: 1,
      pending: true,
      running: false,
      success: false,
      failed: false,
    });
    const val = await task.then();
    expect({
      val,
      depois2: Tasks.list.length,
      pending: Tasks.list[0].pending,
      running: Tasks.list[0].running,
      success: Tasks.list[0].success,
      failed: Tasks.list[0].failed,
    }).toEqual({
      val: "ok",
      depois2: 1,
      pending: false,
      running: false,
      success: true,
      failed: false,
    });
  });
});

describe("task - 1 chield ", () => {
  it("task - simple", async () => {
    Tasks.reset();
    expect({ antes: Tasks.list.length }).toEqual({ antes: 0 });
    const task = Tasks.declare({
      name: "parent",
      async resolver() {
        return "ok1";
      },
    });
    const chield = task.declare({
      name: "chield",
      async resolver() {
        return "ok2";
      },
    });
    expect({
      depois1: Tasks.list.length,
      chields: task.children.length,
      parent: {
        pending: Tasks.list[0].pending,
        running: Tasks.list[0].running,
        success: Tasks.list[0].success,
        failed: Tasks.list[0].failed,
      },
      chield: {
        pending: task.children[0].pending,
        running: task.children[0].running,
        success: task.children[0].success,
        failed: task.children[0].failed,
      },
    }).toEqual({
      depois1: 1,
      chields: 1,
      parent: {
        pending: true,
        running: false,
        success: false,
        failed: false,
      },
      chield: {
        pending: true,
        running: false,
        success: false,
        failed: false,
      },
    });
    const val1 = await task.then();
    const val2 = await chield.then();

    expect({
      val1,
      val2,
      depois1: Tasks.list.length,
      chields: task.children.length,
      parent: {
        pending: Tasks.list[0].pending,
        running: Tasks.list[0].running,
        success: Tasks.list[0].success,
        failed: Tasks.list[0].failed,
      },
      chield: {
        parent: chield.parent && chield.parent.name,
        name: chield.name,
        fullname: chield.fullname,
        pending: task.children[0].pending,
        running: task.children[0].running,
        success: task.children[0].success,
        failed: task.children[0].failed,
      },
    }).toEqual({
      val1: "ok1",
      val2: "ok2",
      depois1: 1,
      chields: 1,
      parent: {
        pending: false,
        running: false,
        success: true,
        failed: false,
      },
      chield: {
        parent: "parent",
        name: "chield",
        fullname: "parent/chield",
        pending: false,
        running: false,
        success: true,
        failed: false,
      },
    });
  });
});

describe("task - 2 children ", () => {
  it("task - 2 children", async () => {
    Tasks.reset();
    expect({ antes: Tasks.list.length }).toEqual({ antes: 0 });
    const task = Tasks.declare({
      name: "parent",
      async resolver() {
        return "ok1";
      },
    });
    const chield1 = task.declare({
      name: "chield1",
      async resolver() {
        return new Promise((resolve) => setTimeout(() => resolve("ok2"), 100));
      },
    });
    const chield2 = task.declare({
      name: "chield2",
      async resolver() {
        return "ok3";
      },
    });
    expect({
      depois1: Tasks.list.length,
      chields: task.children.length,
      parent: {
        pending: Tasks.list[0].pending,
        running: Tasks.list[0].running,
        success: Tasks.list[0].success,
        failed: Tasks.list[0].failed,
      },
      chield0: {
        pending: task.children[0].pending,
        running: task.children[0].running,
        success: task.children[0].success,
        failed: task.children[0].failed,
      },
      chield1: {
        pending: task.children[1].pending,
        running: task.children[1].running,
        success: task.children[1].success,
        failed: task.children[1].failed,
      },
    }).toEqual({
      depois1: 1,
      chields: 2,
      parent: {
        pending: true,
        running: false,
        success: false,
        failed: false,
      },
      chield0: {
        pending: true,
        running: false,
        success: false,
        failed: false,
      },
      chield1: {
        pending: true,
        running: false,
        success: false,
        failed: false,
      },
    });

    const val3 = await chield2.then();

    expect({
      val3,
      depois2: Tasks.list.length,
      chields: task.children.length,
      parent: {
        pending: Tasks.list[0].pending,
        running: Tasks.list[0].running,
        success: Tasks.list[0].success,
        failed: Tasks.list[0].failed,
      },
      chield0: {
        pending: task.children[0].pending,
        running: task.children[0].running,
        success: task.children[0].success,
        failed: task.children[0].failed,
      },
      chield1: {
        pending: task.children[1].pending,
        running: task.children[1].running,
        success: task.children[1].success,
        failed: task.children[1].failed,
      },
    }).toEqual({
      val3: "ok3",
      depois2: 1,
      chields: 2,
      parent: {
        pending: true,
        running: true,
        success: false,
        failed: false,
      },
      chield0: {
        pending: true,
        running: true,
        success: false,
        failed: false,
      },
      chield1: {
        pending: false,
        running: false,
        success: true,
        failed: false,
      },
    });

    const val1 = await task.then();
    const val2 = await chield1.then();

    expect({
      val1,
      val2,
      val3,
      depois2: Tasks.list.length,
      chields: task.children.length,
      parent: {
        pending: Tasks.list[0].pending,
        running: Tasks.list[0].running,
        success: Tasks.list[0].success,
        failed: Tasks.list[0].failed,
      },
      chield0: {
        pending: task.children[0].pending,
        running: task.children[0].running,
        success: task.children[0].success,
        failed: task.children[0].failed,
      },
      chield1: {
        pending: task.children[1].pending,
        running: task.children[1].running,
        success: task.children[1].success,
        failed: task.children[1].failed,
      },
    }).toEqual({
      val1: "ok1",
      val2: "ok2",
      val3: "ok3",
      depois2: 1,
      chields: 2,
      parent: {
        pending: false,
        running: false,
        success: true,
        failed: false,
      },
      chield0: {
        pending: false,
        running: false,
        success: true,
        failed: false,
      },
      chield1: {
        pending: false,
        running: false,
        success: true,
        failed: false,
      },
    });
  });
});