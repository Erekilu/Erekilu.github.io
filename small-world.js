let deck_source = {
  "buffer":{
    "灰流丽": {"name":"灰流丽","level":"3","stats":"炎","race":"不死族","atk":"0","def":"1800"},
    "增殖的G": {"name":"增殖的G","level":"2","stats":"地","race":"昆虫族","atk":"500","def":"200"},
    "效果遮蒙者": {"name":"效果遮蒙者","level":"1","stats":"光","race":"魔法师族","atk":"0","def":"0"},
    "锁鸟": {"name":"锁鸟","level":"1","stats":"风","race":"魔法师族","atk":"0","def":"0"},
    "陨石": {"name":"陨石","level":"11","stats":"光","race":"岩石族","atk":"3000","def":"600"},
    "海龟坏兽": {"name":"海龟坏兽","level":"8","stats":"水","race":"水族","atk":"2200","def":"3000"},
    "怒焰坏兽": {"name":"怒焰坏兽","level":"8","stats":"炎","race":"恐龙族","atk":"3000","def":"1200"},
    "屋敷童": {"name":"屋敷童","level":"3","stats":"地","race":"不死族","atk":"0","def":"1800"},
    "幽鬼兔": {"name":"幽鬼兔","level":"3","stats":"光","race":"念动力族","atk":"0","def":"1800"},
    "浮幽樱": {"name":"浮幽樱","level":"3","stats":"暗","race":"不死族","atk":"0","def":"1800"},
    "天童": {"name":"天童","level":"1","stats":"炎","race":"天使族","atk":"1500","def":"1500"},
    "乌鸦": {"name":"乌鸦","level":"1","stats":"暗","race":"鸟兽族","atk":"100","def":"100"},
  },
  "working":{
  }
}


function source_to_data() {
  let ui_data = Object.entries(deck_source.buffer)
    .concat(Object.entries(deck_source.working))
    .map(([key, value]) => ({ "value": key, "title": key }));
  return ui_data
}

function check_name(name) {
  if (deck_source.buffer.hasOwnProperty(name)) {
      return true;
  } else if (deck_source.working.hasOwnProperty(name)) {
      return true;
  }

  // No duplicate found
  return false;
}

function world_compare(arg1, arg2) {
  let count = 0;
  if (arg1.level === arg2.level) count++;
  if (arg1.stats === arg2.stats) count++;
  if (arg1.race === arg2.race) count++;
  if (arg1.atk === arg2.atk) count++;
  if (arg1.def === arg2.def) count++;
  return count;
}

function world_gather(obj) {

  // 将数组转换为对象，以便按照第二项进行分组
  let groupedObj = obj.reduce((acc, [a1, a2, a3]) => {
    if (!acc[a3]) {
      acc[a3] = [];
    }
    acc[a3].push({ title: a1.padEnd(20, ' ') + " > " + a2.padEnd(20, ' ') + " > " + a3.padEnd(20, ' ') });
    return acc;
  }, {});

  // 将对象转换为最终的数据结构
  let result = Object.entries(groupedObj).map(([title, children]) => ({
    title,
    children,
  }));

  if (result.length === 1) {
    result[0]['spread'] = true;
  }

  return result;
}


layui.use(function(){
  var $ = layui.$;
  var transfer = layui.transfer;
  var layer = layui.layer;
  var util = layui.util;
  var form = layui.form;
  var tree = layui.tree;

  function reload_selection() {
    let keys = Object.keys(deck_source.working);
    let begin = $("#choose_begin_card"), end = $("#choose_end_card");
    begin.empty();
    end.empty();
    begin.append('<option value="">选择或搜索起始卡牌</option>');
    end.append('<option value="">选择或搜索目标卡牌</option>');
    for (const key of keys) {
      begin.append('<option value="' + key + '">' + key + '</option>')
      end.append('<option value="' + key + '">' + key + '</option>')
    }
    form.render();
  }

  reload_selection();

  util.on('lay-on', {
    'add-card': function() {
      layer.open({
        type: 1,
        title: '填写卡牌描述',
        content: $('#ID-test-layer-wrapper')
      });
    },
    "import-deck": function(){
      layer.open({
        type: 1,
        title: '请粘贴套牌码（与导出的内容相同）',
        shadeClose: true,
        content: `
<div class="layui-field-box">
  <form class="layui-form layui-form-pane" action="">
    <div class="layui-form-item layui-form-text">
      <div class="layui-input-block">
        <textarea placeholder="" class="layui-textarea" name="import_deck_code"></textarea>
      </div>
    </div>

    <div class="layui-form-item">
      <div class="layui-input-block">
        <button class="layui-btn" lay-filter="world-import-deck" lay-submit>导入</button>
      </div>
    </div>
  </form>
</div>`
      });
    },
    "export-deck": function() {
      layer.alert(JSON.stringify(deck_source), {title: "导出成功（请复制并保存）"});
    },
    "come-on": function() {
      let begin_name = $("#choose_begin_card").val(), end_name = $("#choose_end_card").val();
      if (begin_name === "") {
        return false;
      }
      let working_map = deck_source.working

      let begin_obj, end_obj;
      if (working_map.hasOwnProperty(begin_name)) {
        begin_obj = working_map[begin_name]
      }
      if (working_map.hasOwnProperty(end_name)) {
        end_obj = working_map[end_name]
      } else {
        end_obj = null;
      }

      let success_count = 0, result_detail = [];
      for (let key in working_map) {
        if (working_map.hasOwnProperty(key)) {
          let one_step = working_map[key];
          let count = world_compare(begin_obj, one_step);
          if (count !== 1) {
            continue;
          }

          for (let key_two in working_map) {
            let two_step = working_map[key_two];
            let count_two = world_compare(one_step, two_step);
            if (count_two !== 1 || begin_obj.name === two_step.name) {
              continue;
            }

            if (end_name == "" || two_step.name === end_name) {
              success_count++;
              result_detail.push([begin_obj.name, one_step.name, two_step.name]);
            }
            
          }

        }
      }

      if (success_count === 0) {
        layer.alert('无法检索目标卡牌!', {
          icon: 2,
          shadeClose: true
        });
        return false;
      }

      let tree_data = world_gather(result_detail);
      tree.reload('world_tree', { 
        data: tree_data,

      });


      layui.$('#world_result').css('display', 'block');

    }
  });


  // 小世界新增卡牌
  form.on('submit(world-add-card)', function(data) {
    // 名称重复判断
    check_result = check_name(data.field.world_name)
    if (check_result) {
      layer.alert('添加失败，卡牌名 [' + data.field.world_name + '] 重复!', {
        icon: 2,
        shadeClose: true
      });
      return false;
    };

    deck_source.working[data.field.world_name] = 
      {"name":data.field.world_name,"level":data.field.world_level,"stats":data.field.world_stats,
      "race":data.field.world_race,"atk":data.field.world_atk,"def":data.field.world_def};

    // 重加载
    transfer.reload('world_add_card_form', {data: source_to_data(), value: Object.keys(deck_source.working)})
    reload_selection();

    layer.alert('添加成功！', {
      shadeClose: true
    });

    return false;
  });

  // 小世界导入卡组
  form.on('submit(world-import-deck)', function(data) {
    try {
      deck_source = JSON.parse(String(data.field.import_deck_code));
    } catch (error) {
      layer.alert('卡组解析失败，格式异常！第一次使用请手动添加单卡，完成后即可导出卡组代码。', {
        icon: 2,
        shadeClose: true
      });
      return false;
    }
    
    // 重加载
    transfer.reload('world_add_card_form', {data: source_to_data(), value: Object.keys(deck_source.working)})
    reload_selection();

    layer.alert('导入成功！', {
      shadeClose: true
    });
    return false;
  });


  // 渲染
  transfer.render({
    id: 'world_add_card_form',
    elem: '#small-world',
    title: ['备选卡牌','当前卡组'],
    data: source_to_data(),
    value: Object.keys(deck_source.working),
    onchange: function(obj, index) {
      for (let i = 0 ; i < obj.length ; i++) {
        let card_name = obj[i].value
        if (index === 0) {
          // 从左至右
          deck_source.working[card_name] = deck_source.buffer[card_name]
          delete deck_source.buffer[card_name]
          reload_selection();
        } else {
          // 从右至左
          deck_source.buffer[card_name] = deck_source.working[card_name]
          delete deck_source.working[card_name]
          reload_selection();
        }
      }
    }
  });

  tree.render({
    id: 'world_tree',
    elem: '#ID-tree-demo-accordion',
    data: []
  });

});